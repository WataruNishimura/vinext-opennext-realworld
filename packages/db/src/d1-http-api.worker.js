// The D1 part of the Cloudflare REST API (`POST …/d1/database/:id/query` and `…/raw`), served by
// a Worker in Miniflare. Tests and local runs of apps without a D1 binding (apps/next) talk to it
// instead of api.cloudflare.com.
//
// Statements go to the same D1 database object that backs the Workers binding: through the
// binding's own fetcher, the endpoint its prepare(), batch() and raw() use. That keeps parameter
// handling, batch transactions, meta and error messages identical to D1 in workerd. The fetcher is
// a workerd implementation detail; the tests in test/d1-http.test.ts fail if it moves.
//
// Envelope and errors follow https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/raw/:
// `{ success, errors: [{ code, message }], messages, result: [{ success, results, meta }] }`.

const ROUTE = /^\/client\/v4\/accounts\/([^/]+)\/d1\/database\/([^/]+)\/(query|raw)$/;

/** @param {number} status @param {number} code @param {string} message */
function failure(status, code, message) {
  return Response.json(
    { success: false, errors: [{ code, message }], messages: [], result: null },
    { status },
  );
}

/** @param {unknown} query */
function isQuery(query) {
  return (
    typeof query === 'object' &&
    query !== null &&
    'sql' in query &&
    typeof query.sql === 'string' &&
    (!('params' in query) || query.params === undefined || Array.isArray(query.params))
  );
}

/** @param {unknown} body @returns {{ sql: string, params?: unknown[] }[] | null} */
function queriesFrom(body) {
  if (typeof body !== 'object' || body === null) return null;
  if ('batch' in body) {
    return Array.isArray(body.batch) && body.batch.every(isQuery) ? body.batch : null;
  }
  return isQuery(body) ? [body] : null;
}

export default {
  /**
   * @param {Request} request
   * @param {{ DB: { fetcher: Fetcher }, ACCOUNT_ID: string, DATABASE_ID: string, API_TOKEN: string }} env
   */
  async fetch(request, env) {
    const match = ROUTE.exec(new URL(request.url).pathname);
    if (request.method !== 'POST' || !match) {
      return failure(404, 7000, 'No route for that URI');
    }
    if (request.headers.get('authorization') !== `Bearer ${env.API_TOKEN}`) {
      return failure(401, 10000, 'Authentication error');
    }
    const [, accountId, databaseId, endpoint] = match;
    if (accountId !== env.ACCOUNT_ID || databaseId !== env.DATABASE_ID) {
      return failure(404, 7404, 'The database could not be found');
    }

    const queries = queriesFrom(await request.json().catch(() => null));
    if (!queries) return failure(400, 7400, 'Invalid request body');

    const format = endpoint === 'raw' ? 'ROWS_AND_COLUMNS' : 'ARRAY_OF_OBJECTS';
    const response = await env.DB.fetcher.fetch(`http://d1/query?resultsFormat=${format}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(queries),
    });
    const text = await response.text();
    /** @type {unknown} */
    let results;
    try {
      results = JSON.parse(text);
    } catch {
      // The database object answers invalid parameters with a plain-text validation error.
      return failure(400, 7400, text.split('\n')[0] ?? 'Invalid request body');
    }
    if (!Array.isArray(results)) {
      const message =
        typeof results === 'object' && results !== null && 'error' in results
          ? String(results.error)
          : 'D1 query failed';
      return failure(400, 7500, message);
    }
    return Response.json({ success: true, errors: [], messages: [], result: results });
  },
};
