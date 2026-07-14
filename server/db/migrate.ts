import { db } from './index.ts'
import { categories, rooms, items } from './schema.ts'
import { sql } from 'drizzle-orm'

// 建表
db.run(sql`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    parent_id TEXT
  )
`)

db.run(sql`
  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'living'
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
    created_at TEXT NOT NULL
  )
`)

// 写入默认分类（如果表是空的）
const existingCategories = db.select().from(categories).all()
if (existingCategories.length === 0) {
  db.insert(categories).values([
    { id: '1', name: '电子产品', color: '#45B7D1' },
    { id: '2', name: '家具', color: '#96CEB4' },
    { id: '3', name: '厨具', color: '#FF6B6B' },
    { id: '4', name: '家电', color: '#4ECDC4' },
    { id: '5', name: '书籍', color: '#4ECDC4' },
    { id: '5-1', name: '同人本', color: '#4ECDC4', parentId: '5' },
    { id: '6', name: '衣物鞋包', color: '#FFA07A' },
    { id: '7', name: '唱片', color: '#96CEB4' },
    { id: '8', name: '影碟', color: '#FFEAA7' },
  ]).run()
}

// 写入默认房间
const existingRooms = db.select().from(rooms).all()
if (existingRooms.length === 0) {
  db.insert(rooms).values([
    { id: 'r1', name: '客厅', icon: 'living' },
    { id: 'r2', name: '卧室', icon: 'bedroom' },
    { id: 'r3', name: '厨房', icon: 'kitchen' },
    { id: 'r4', name: '书房', icon: 'study' },
    { id: 'r5', name: '卫生间', icon: 'bathroom' },
    { id: 'r6', name: '阳台', icon: 'balcony' },
  ]).run()
}

console.log('数据库初始化完成')
