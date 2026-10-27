import type { D1Result } from '@cloudflare/workers-types';
import { asc, count, eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createD1HttpBinding, D1HttpError } from '../src/d1-http.ts';
import { createDb, schema, type D1Binding } from '../src/index.ts';
import { seed } from '../src/seed.ts';
import { createTestDatabase, type TestDatabase } from '../src/testing.ts';

/** Drop the fields that differ between two runs of the same statement (timings). */
function stable<T>(result: D1Result<T>) {
  const { duration: _duration, timings: _timings, ...meta } = result.meta;
  return { ...result, meta };
}

async function rejection(run: () => Promise<unknown>): Promise<Error> {
  try {
    await run();
  } catch (error) {
    if (error instanceof Error) return error;
    throw new Error('Rejected with a non-Error', { cause: error });
  }
  throw new Error('Expected the promise to reject');
}

describe('createD1HttpBinding', () => {
  let testDb: TestDatabase;
  /** The Workers binding: the reference every HTTP result is compared with. */
  let binding: D1Binding;
  /** The same database, reached through the emulated Cloudflare REST API. */
  let http: D1Binding;
  let requests: Request[];

  beforeAll(async () => {
    testDb = await createTestDatabase();
    await seed(testDb.db);
    binding = testDb.binding;
    await binding.exec(
      'CREATE TABLE notes (id INTEGER PRIMARY KEY, body TEXT NOT NULL, amount REAL, flag INTEGER)',
    );
    http = createD1HttpBinding({
      ...testDb.api,
      fetch: (input, init) => {
        requests.push(new Request(input, init));
        return testDb.api.fetch(input, init);
      },
    });
  });

  beforeEach(() => {
    requests = [];
  });

  afterAll(async () => {
    await testDb.dispose();
  });

  describe('requests', () => {
    it('posts a statement and its params to the raw endpoint with the API token', async () => {
      await http.prepare('SELECT ? AS a, ? AS b').bind(1, 'two').all();

      expect(requests).toHaveLength(1);
      const [request] = requests;
      expect(request?.method).toBe('POST');
      expect(request?.url).toBe(
        `${testDb.api.baseUrl}/accounts/${testDb.api.accountId}/d1/database/${testDb.api.databaseId}/raw`,
      );
      expect(request?.headers.get('authorization')).toBe(`Bearer ${testDb.api.apiToken}`);
      expect(request?.headers.get('content-type')).toBe('application/json');
      expect(await request?.json()).toEqual({ sql: 'SELECT ? AS a, ? AS b', params: [1, 'two'] });
    });

    it('sends a batch as one request', async () => {
      await http.batch([http.prepare('SELECT 1'), http.prepare('SELECT ?').bind(2)]);

      expect(requests).toHaveLength(1);
      expect(await requests[0]?.json()).toEqual({
        batch: [
          { sql: 'SELECT 1', params: [] },
          { sql: 'SELECT ?', params: [2] },
        ],
      });
    });

    it('defaults to the Cloudflare API', async () => {
      const urls: string[] = [];
      const binding = createD1HttpBinding({
        accountId: 'account',
        databaseId: 'database',
        apiToken: 'token',
        fetch: input => {
          urls.push(new Request(input).url);
          return Promise.resolve(Response.json({ success: true, errors: [], result: [] }));
        },
      });
      await binding.exec('SELECT 1');
      expect(urls).toEqual([
        'https://api.cloudflare.com/client/v4/accounts/account/d1/database/database/raw',
      ]);
    });
  });

  describe('prepared statements', () => {
    const productsById = 'SELECT * FROM products WHERE id IN (?, ?) ORDER BY id';

    it('all() returns the same rows and meta as the binding', async () => {
      const expected = await binding.prepare(productsById).bind(3, 7).all();
      const actual = await http.prepare(productsById).bind(3, 7).all();
      expect(actual.results).toHaveLength(2);
      expect(stable(actual)).toEqual(stable(expected));
    });

    it('run() returns the same result as the binding', async () => {
      const expected = await binding.prepare(productsById).bind(1, 2).run();
      const actual = await http.prepare(productsById).bind(1, 2).run();
      expect(stable(actual)).toEqual(stable(expected));
    });

    it('first() returns the first row, a column of it, or null', async () => {
      const statement = 'SELECT id, name FROM products WHERE id >= ? ORDER BY id';
      expect(await http.prepare(statement).bind(5).first()).toEqual(
        await binding.prepare(statement).bind(5).first(),
      );
      expect(await http.prepare(statement).bind(5).first('name')).toEqual(
        await binding.prepare(statement).bind(5).first('name'),
      );
      expect(await http.prepare(statement).bind(10_000).first()).toBeNull();
      expect(await http.prepare(statement).bind(10_000).first('name')).toBeNull();
    });

    it('first(column) rejects an unknown column like the binding', async () => {
      const statement = 'SELECT id FROM products WHERE id = 1';
      const expected = await rejection(() => binding.prepare(statement).first('missing'));
      const actual = await rejection(() => http.prepare(statement).first('missing'));
      expect(actual.message).toBe(expected.message);
    });

    it('raw() keeps duplicate column names and their order', async () => {
      const statement =
        'SELECT p.id, c.id, p.name, c.name FROM products p JOIN categories c ON c.id = p.category_id ORDER BY p.id LIMIT 3';
      const expected = await binding.prepare(statement).raw({ columnNames: true });
      const actual = await http.prepare(statement).raw({ columnNames: true });
      expect(actual[0]).toEqual(['id', 'id', 'name', 'name']);
      expect(actual).toEqual(expected);
      expect(await http.prepare(statement).raw()).toEqual(await binding.prepare(statement).raw());
    });

    it('binds numbers, strings, booleans and null like the binding', async () => {
      const statement =
        'SELECT ? AS int, ? AS real, ? AS text, ? AS yes, ? AS no, ? AS empty, typeof(?) AS type';
      const values = [42, 1.5, 'text', true, false, null, 7];
      const expected = await binding
        .prepare(statement)
        .bind(...values)
        .first();
      const actual = await http
        .prepare(statement)
        .bind(...values)
        .first();
      expect(actual).toEqual(expected);
    });

    it('rejects an undefined parameter like the binding', async () => {
      const expected = await rejection(() => binding.prepare('SELECT ?').bind(undefined).all());
      const actual = await rejection(() => http.prepare('SELECT ?').bind(undefined).all());
      expect(actual.message).toBe(expected.message);
    });

    it('bind() returns a new statement and leaves the original unbound', async () => {
      const unbound = http.prepare('SELECT ? AS value');
      const bound = unbound.bind(1);
      expect(bound).not.toBe(unbound);
      expect(await bound.first('value')).toBe(1);
      expect(await unbound.bind(2).first('value')).toBe(2);
    });

    it('reports writes in meta', async () => {
      const result = await http
        .prepare('INSERT INTO notes (body, amount, flag) VALUES (?, ?, ?)')
        .bind('first', 2.5, true)
        .run();
      const row = await binding
        .prepare('SELECT id, body, amount, flag FROM notes WHERE body = ?')
        .bind('first')
        .first();

      expect(row).toEqual({ id: result.meta.last_row_id, body: 'first', amount: 2.5, flag: 1 });
      expect(result.success).toBe(true);
      expect(result.results).toEqual([]);
      expect(result.meta).toMatchObject({
        changes: 1,
        changed_db: true,
      });
      expect(result.meta.rows_written).toBeGreaterThan(0);
    });

    it('rejects invalid SQL with the binding message', async () => {
      const expected = await rejection(() => binding.prepare('SELECT * FROM missing_table').all());
      const actual = await rejection(() => http.prepare('SELECT * FROM missing_table').all());
      expect(actual.message).toBe(expected.message);
    });
  });

  describe('batch()', () => {
    it('returns one result per statement, like the binding', async () => {
      const statements = (db: D1Binding) => [
        db.prepare('SELECT id, slug FROM categories ORDER BY id'),
        db.prepare('SELECT count(*) AS total FROM products WHERE category_id = ?').bind(2),
      ];
      const expected = await binding.batch(statements(binding));
      const actual = await http.batch(statements(http));
      expect(actual.map(stable)).toEqual(expected.map(stable));
    });

    it('rolls the whole batch back when a statement fails', async () => {
      const statements = (db: D1Binding, body: string) => [
        db.prepare('INSERT INTO notes (body) VALUES (?)').bind(body),
        db.prepare('INSERT INTO missing_table VALUES (1)'),
      ];
      const expected = await rejection(() => binding.batch(statements(binding, 'binding')));
      const actual = await rejection(() => http.batch(statements(http, 'http')));

      expect(actual.message).toBe(expected.message);
      const rows = await binding
        .prepare("SELECT body FROM notes WHERE body IN ('binding', 'http')")
        .all();
      expect(rows.results).toEqual([]);
    });
  });

  describe('exec()', () => {
    it('runs several statements and counts them like the binding', async () => {
      const query =
        "INSERT INTO notes (body) VALUES ('exec 1');\nINSERT INTO notes (body) VALUES ('exec 2');";
      const expected = await binding.exec(query.replaceAll('exec', 'binding exec'));
      const actual = await http.exec(query);
      expect(actual.count).toBe(expected.count);
      expect(actual.duration).toEqual(expect.any(Number));
      const rows = await binding.prepare("SELECT body FROM notes WHERE body LIKE 'exec %'").raw();
      expect(rows).toEqual([['exec 1'], ['exec 2']]);
    });
  });

  describe('withSession()', () => {
    it('queries through the same API and has no bookmark', async () => {
      const session = http.withSession('first-primary');
      expect(await session.prepare('SELECT 1 AS one').first('one')).toBe(1);
      expect(await session.batch([session.prepare('SELECT 2 AS two')])).toHaveLength(1);
      expect(session.getBookmark()).toBeNull();
    });
  });

  describe('API errors', () => {
    it('rejects with a D1HttpError carrying the status and API errors', async () => {
      const unauthorized = createD1HttpBinding({ ...testDb.api, apiToken: 'wrong-token' });
      const error = await rejection(() => unauthorized.prepare('SELECT 1').all());

      expect(error).toBeInstanceOf(D1HttpError);
      expect(error).toMatchObject({ status: 401 });
      expect(error.message).toMatch(/Authentication error/);
    });

    it('rejects a response that is not JSON', async () => {
      const broken = createD1HttpBinding({
        ...testDb.api,
        fetch: () => Promise.resolve(new Response('Bad gateway', { status: 502 })),
      });
      const error = await rejection(() => broken.prepare('SELECT 1').all());
      expect(error).toBeInstanceOf(D1HttpError);
      expect(error).toMatchObject({ status: 502 });
    });
  });

  describe('over the network', () => {
    it('serves the emulated API on baseUrl for the global fetch', async () => {
      const { fetch: _dispatch, ...api } = testDb.api;
      const network = createD1HttpBinding(api);
      expect(await network.prepare('SELECT count(*) AS total FROM categories').first('total')).toBe(
        await binding.prepare('SELECT count(*) AS total FROM categories').first('total'),
      );
    });
  });

  describe('with Drizzle', () => {
    it('reads joins and batches exactly like the binding', async () => {
      const read = async (db: ReturnType<typeof createDb>) => {
        const joined = await db
          .select()
          .from(schema.products)
          .innerJoin(schema.categories, eq(schema.categories.id, schema.products.categoryId))
          .orderBy(asc(schema.products.id))
          .limit(4);
        const relational = await db.query.products.findFirst({
          where: eq(schema.products.id, 9),
          with: { category: true, inventory: true },
        });
        const batched = await db.batch([
          db.select({ id: schema.categories.id }).from(schema.categories),
          db.select({ total: count() }).from(schema.products),
        ]);
        return { joined, relational, batched };
      };

      const expected = await read(createDb(binding));
      const actual = await read(createDb(http));
      expect(actual.joined).toHaveLength(4);
      expect(actual).toEqual(expected);
    });
  });
});
