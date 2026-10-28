import { spawn, type ChildProcess } from 'node:child_process';
import { createWriteStream } from 'node:fs';

/** Run a command to completion, appending its output to `logFile`. Rejects on a non-zero exit. */
export function run(command: readonly string[], cwd: string, logFile: string): Promise<void> {
  const [file, ...args] = command;
  if (file === undefined) return Promise.reject(new Error('Empty command'));
  const log = createWriteStream(logFile, { flags: 'a' });
  log.write(`\n$ ${command.join(' ')}  (in ${cwd})\n`);
  return new Promise((resolve, reject) => {
    const child = spawn(file, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.pipe(log, { end: false });
    child.stderr.pipe(log, { end: false });
    child.on('error', reject);
    child.on('close', code => {
      log.end();
      if (code === 0) resolve();
      else reject(new Error(`\`${command.join(' ')}\` exited with ${code}; see ${logFile}`));
    });
  });
}

async function responds(url: string): Promise<boolean> {
  try {
    await fetch(url, { signal: AbortSignal.timeout(10_000) });
    return true;
  } catch {
    return false;
  }
}

export type Server = { url: string; stop: () => void };

/**
 * Start a long-running server in its own process group and wait until `url` answers. Refuses to
 * start when something already answers there, so a stale server is never compared by mistake.
 */
export async function startServer(
  command: readonly string[],
  cwd: string,
  url: string,
  logFile: string,
  timeoutMs = 120_000,
): Promise<Server> {
  if (await responds(url)) {
    throw new Error(`${url} already answers; stop that server or pass its URL explicitly.`);
  }
  const [file, ...args] = command;
  if (file === undefined) throw new Error('Empty command');
  const log = createWriteStream(logFile, { flags: 'a' });
  log.write(`\n$ ${command.join(' ')}  (in ${cwd})\n`);
  const child: ChildProcess = spawn(file, args, {
    cwd,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout?.pipe(log);
  child.stderr?.pipe(log);
  const stop = () => {
    if (child.pid !== undefined && child.exitCode === null) {
      try {
        process.kill(-child.pid, 'SIGTERM');
      } catch {
        // Already gone.
      }
    }
  };

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`\`${command.join(' ')}\` exited with ${child.exitCode}; see ${logFile}`);
    }
    if (await responds(url)) return { url, stop };
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  stop();
  throw new Error(`${url} did not answer within ${timeoutMs / 1000}s; see ${logFile}`);
}
