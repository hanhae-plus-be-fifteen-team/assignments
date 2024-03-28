import * as pg_promise from 'pg-promise'

const pgp = pg_promise({})

/**
 * @todo 원인 분석이 필요함.
 *  WARNING: Creating a duplicate database object for the same connection.
 *         at createDb (/Users/yoojehwan/WebstormProjects/hhplus-tdd-nest/jehwan/week-2/src/database/index.ts:6:10)
 *         at Object.<anonymous> (/Users/yoojehwan/WebstormProjects/hhplus-tdd-nest/jehwan/week-2/test/app.e2e-spec.ts:92:26)
 *         at processTicksAndRejections (node:internal/process/task_queues:95:5)
 */
export function createDb() {
  return pgp({
    host: process.env.DB_HOST ?? 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })
}
