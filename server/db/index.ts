import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import * as schema from './schema.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = resolve(__dirname, '../data/inventory.db')

const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL') // 提升并发读写性能

export const db = drizzle(sqlite, { schema })
