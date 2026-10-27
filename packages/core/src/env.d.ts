// Declared explicitly so `process.env.NODE_ENV` stays dot-accessed: bundlers (Next.js, Vite)
// replace that exact expression at build time.
declare namespace NodeJS {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- declaration merging needs an interface
  interface ProcessEnv {
    readonly NODE_ENV?: 'development' | 'production' | 'test';
  }
}
