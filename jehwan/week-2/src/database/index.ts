import { Pool } from 'pg'

export function createConnection() {
  return new Pool({
    host: process.env.DB_HOST ?? 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: process.env.DB_POOL_MAX ? Number(process.env.DB_POOL_MAX) : 30,
  })
}
