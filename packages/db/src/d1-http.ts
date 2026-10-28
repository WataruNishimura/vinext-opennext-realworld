import type {
  D1Database,
  D1DatabaseSession,
  D1ExecResult,
  D1Meta,
  D1PreparedStatement,
  D1Result,
} from '@cloudflare/workers-types';
import type { D1Binding } from './client.ts';

export type D1HttpOptions = {
  /** The Cloudflare account that owns the database. */
  accountId: string;
  /** The D1 database ID (the `id` in `cloudflare.config.ts`). */
  databaseId: string;
  /** An API token with the D1 Edit permission (D1 Read is enough for a read-only app). */
  apiToken: string;
  /** Defaults to `https://api.cloudflare.com/client/v4`. */
  baseUrl?: string;
  /** Defaults to the global `fetch`. */
  fetch?: typeof fetch;
};

export type D1HttpApiMessage = { code: number; message: string };

/** The Cloudflare API rejected a request. SQL errors arrive here too, with D1's message. */
export class D1HttpError extends Error {
  readonly status: number;
  readonly errors: readonly D1HttpApiMessage[];

  constructor(status: number, errors: readonly D1HttpApiMessage[]) {
    const detail = errors.map(error => error.message).join('; ') || `HTTP ${status}`;
    super(`D1_ERROR: ${detail}`);
    this.name = 'D1HttpError';
    this.status = status;
    this.errors = errors;
  }
}

/** A bound value as D1 sends it: blobs travel as arrays of bytes. */
type D1Value = string | number | null | number[];
type D1Query = { sql: string; params: D1Value[] };
type D1RawResult = { columns: string[]; rows: unknown[][]; meta: D1Meta & Record<string, unknown> };

const DEFAULT_BASE_URL = 'https://api.cloudflare.com/client/v4';

const EMPTY_META: D1Meta = {
  duration: 0,
  size_after: 0,
  rows_read: 0,
  rows_written: 0,
  last_row_id: 0,
  changed_db: false,
  changes: 0,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function apiMessages(value: unknown): D1HttpApiMessage[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map(entry => ({
    code: typeof entry['code'] === 'number' ? entry['code'] : 0,
    message: typeof entry['message'] === 'string' ? entry['message'] : 'Unknown error',
  }));
}

function rawResult(value: unknown): D1RawResult {
  const results = isRecord(value) && isRecord(value['results']) ? value['results'] : {};
  const columns = Array.isArray(results['columns']) ? results['columns'].map(String) : [];
  const rows = Array.isArray(results['rows'])
    ? results['rows'].filter((row): row is unknown[] => Array.isArray(row))
    : [];
  const meta = isRecord(value) && isRecord(value['meta']) ? value['meta'] : {};
  return { columns, rows, meta: { ...EMPTY_META, ...meta } };
}

/** Encode a bound value the way the Workers binding does, with the same type errors. */
function encodeValue(value: unknown): D1Value {
  if (typeof value === 'number' || typeof value === 'string' || value === null) return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value instanceof ArrayBuffer) return Array.from(new Uint8Array(value));
  if (ArrayBuffer.isView(value)) {
    return Array.from(new Uint8Array(value.buffer, value.byteOffset, value.byteLength));
  }
  if (
    Array.isArray(value) &&
    value.every(byte => Number.isInteger(byte) && byte >= 0 && byte < 256)
  ) {
    return value.map(Number);
  }
  throw new Error(
    `D1_TYPE_ERROR: Type '${typeof value}' not supported for value '${shown(value)}'`,
  );
}

/** `value` as a template literal would print it, which is what the binding's error message shows. */
function shown(value: unknown): string {
  switch (typeof value) {
    case 'object':
    case 'function':
      return Object.prototype.toString.call(value);
    case 'symbol':
      return value.toString();
    case 'string':
      return value;
    case 'number':
    case 'bigint':
    case 'boolean':
      return String(value);
    default:
      return 'undefined';
  }
}

function toObjects<T>({ columns, rows }: D1RawResult): T[] {
  // Later columns win on duplicate names, as with the binding's object results.
  return rows.map(row => Object.fromEntries(columns.map((name, i) => [name, row[i]])) as T);
}

function toResult<T>(raw: D1RawResult): D1Result<T> {
  return { success: true, meta: raw.meta, results: toObjects<T>(raw) };
}

class D1HttpClient {
  readonly #url: string;
  readonly #apiToken: string;
  readonly #fetch: typeof fetch;

  constructor({ accountId, databaseId, apiToken, baseUrl, fetch: fetcher }: D1HttpOptions) {
    const base = (baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.#url = `${base}/accounts/${encodeURIComponent(accountId)}/d1/database/${encodeURIComponent(databaseId)}/raw`;
    this.#apiToken = apiToken;
    this.#fetch = fetcher ?? globalThis.fetch;
  }

  /**
   * Run statements through `POST …/raw`, which keeps rows as arrays with their column names, so
   * duplicate names in joins survive. A `batch` runs in one transaction, like `D1Database.batch`.
   */
  async send(body: D1Query | { batch: D1Query[] }): Promise<D1RawResult[]> {
    const response = await this.#fetch(this.#url, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.#apiToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    let envelope: unknown;
    try {
      envelope = await response.json();
    } catch {
      throw new D1HttpError(response.status, [
        { code: 0, message: `Expected JSON from the D1 API (HTTP ${response.status})` },
      ]);
    }
    if (!response.ok || !isRecord(envelope) || envelope['success'] !== true) {
      throw new D1HttpError(
        response.status,
        apiMessages(isRecord(envelope) ? envelope['errors'] : []),
      );
    }
    const result = envelope['result'];
    return Array.isArray(result) ? result.map(rawResult) : [];
  }
}

class D1HttpPreparedStatement implements D1PreparedStatement {
  readonly query: D1Query;
  readonly #client: D1HttpClient;

  constructor(client: D1HttpClient, query: D1Query) {
    this.#client = client;
    this.query = query;
  }

  bind(...values: unknown[]): D1HttpPreparedStatement {
    return new D1HttpPreparedStatement(this.#client, {
      sql: this.query.sql,
      params: values.map(encodeValue),
    });
  }

  async #raw(): Promise<D1RawResult> {
    const [result] = await this.#client.send(this.query);
    return result ?? rawResult(undefined);
  }

  // The overloads (and their type parameter defaults) mirror D1PreparedStatement.
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  first<T = unknown>(colName: string): Promise<T | null>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  async first<T>(colName?: string): Promise<T | null> {
    const [row] = toObjects<Record<string, unknown>>(await this.#raw());
    if (!row) return null;
    if (colName === undefined) return row as T;
    if (!(colName in row)) throw new Error(`D1_COLUMN_NOTFOUND: Column not found (${colName})`);
    return (row[colName] ?? null) as T | null;
  }

  async run<T = Record<string, unknown>>(): Promise<D1Result<T>> {
    return toResult<T>(await this.#raw());
  }

  async all<T = Record<string, unknown>>(): Promise<D1Result<T>> {
    return toResult<T>(await this.#raw());
  }

  raw<T = unknown[]>(options: { columnNames: true }): Promise<[string[], ...T[]]>;
  raw<T = unknown[]>(options?: { columnNames?: false }): Promise<T[]>;
  async raw<T = unknown[]>(options?: { columnNames?: boolean }): Promise<[string[], ...T[]] | T[]> {
    const { columns, rows } = await this.#raw();
    const values = rows as T[];
    return options?.columnNames ? [columns, ...values] : values;
  }
}

function queriesOf(statements: D1PreparedStatement[]): D1Query[] {
  return statements.map(statement => {
    if (!(statement instanceof D1HttpPreparedStatement)) {
      throw new TypeError('D1 HTTP batch() only accepts statements from the same binding');
    }
    return statement.query;
  });
}

class D1HttpSession implements D1DatabaseSession {
  readonly #client: D1HttpClient;

  constructor(client: D1HttpClient) {
    this.#client = client;
  }

  prepare(query: string): D1HttpPreparedStatement {
    return new D1HttpPreparedStatement(this.#client, { sql: query, params: [] });
  }

  async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
    const results = await this.#client.send({ batch: queriesOf(statements) });
    return results.map(result => toResult<T>(result));
  }

  /** The REST API has no read replication sessions, so there is never a bookmark. */
  getBookmark(): null {
    return null;
  }
}

class D1HttpDatabase extends D1HttpSession implements D1Database {
  readonly #client: D1HttpClient;

  constructor(client: D1HttpClient) {
    super(client);
    this.#client = client;
  }

  /** Like the binding, runs each line of `query` as its own statement, in one transaction. */
  async exec(query: string): Promise<D1ExecResult> {
    const lines = query.trim().split('\n');
    const results = await this.#client.send({
      batch: lines.map(sql => ({ sql, params: [] })),
    });
    return {
      count: results.length,
      duration: results.reduce((total, result) => total + result.meta.duration, 0),
    };
  }

  /** Every query already goes to the primary; the constraint or bookmark is ignored. */
  withSession(): D1DatabaseSession {
    return new D1HttpSession(this.#client);
  }

  dump(): Promise<ArrayBuffer> {
    return Promise.reject(new Error('D1_DUMP_ERROR: dump() is not available over the REST API'));
  }
}

/**
 * A `D1Database` over the Cloudflare D1 REST API, for runtimes without a D1 binding (Vercel,
 * Node.js). It implements what `drizzle-orm/d1` uses: `prepare`, `bind`, `first`, `all`, `raw`,
 * `run` and `batch`, plus `exec` and `withSession`. Each call is one HTTPS request.
 */
export function createD1HttpBinding(options: D1HttpOptions): D1Binding {
  return new D1HttpDatabase(new D1HttpClient(options));
}
