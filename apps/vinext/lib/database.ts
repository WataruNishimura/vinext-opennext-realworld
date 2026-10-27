import { env } from 'cloudflare:workers';
import { configureDatabase } from '@realworld/core/database';

// vinext runs the RSC environment in workerd, so bindings come straight from `cloudflare:workers`.
configureDatabase(() => env.DB);
