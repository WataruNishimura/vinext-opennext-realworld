// Configure D1 once per server process, before the first request. The root layout imports it too,
// but a Server Function can run on a fresh instance before any layout module has loaded.
export async function register() {
  await import('./lib/database.ts');
}
