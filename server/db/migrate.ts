import { db } from './index.ts'
import { sql } from 'drizzle-orm'

// 创建迁移记录表（这个表本身永远不会变，所以用 IF NOT EXISTS 没问题）
db.run(sql`
  CREATE TABLE IF NOT EXISTS _migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    run_at TEXT NOT NULL
  )
`)

function hasRun(name: string): boolean {
  const row = db.get<{ id: number }>(sql`SELECT id FROM _migrations WHERE name = ${name}`)
  return !!row
}

function markDone(name: string) {
  db.run(sql`INSERT INTO _migrations (name, run_at) VALUES (${name}, ${new Date().toISOString()})`)
}

function runMigration(name: string, fn: () => void) {
  if (hasRun(name)) return
  console.log(`执行迁移: ${name}`)
  fn()
  markDone(name)
}

// ─── 迁移列表，只能追加，不能修改已有的 ──────────────

runMigration('0001_init', () => {
  db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `)
  db.run(sql`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      parent_id TEXT,
      user_id TEXT NOT NULL
    )
  `)
  db.run(sql`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'living',
      user_id TEXT NOT NULL
    )
  `)
  db.run(sql`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category_id TEXT,
      room_id TEXT,
      price REAL,
      quantity INTEGER NOT NULL DEFAULT 1,
      description TEXT,
      image_url TEXT,
      favorite INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      user_id TEXT NOT NULL
    )
  `)
})

// 以后加新字段就在这里追加，例如：
// runMigration('0002_items_add_location', () => {
//   db.run(sql`ALTER TABLE items ADD COLUMN location TEXT`)
// })

console.log('数据库迁移完成')
