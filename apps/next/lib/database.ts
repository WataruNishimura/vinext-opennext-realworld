import { configureDatabase } from '@realworld/core/database';
import type { D1Binding } from '@realworld/db';
import { createD1HttpBinding } from '@realworld/db/d1-http';
import { d1HttpOptionsFromEnv } from './d1-env.ts';

// Vercel has no D1 binding, so the app reaches the same D1 database over the Cloudflare REST API.
// The binding is created on first use, so a missing variable fails the query that needed it.
let binding: D1Binding | undefined;

configureDatabase(() => (binding ??= createD1HttpBinding(d1HttpOptionsFromEnv(process.env))));
