import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
})

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  parentId: text('parent_id'),
  userId: text('user_id').notNull(),
})

export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull().default('living'),
  userId: text('user_id').notNull(),
})

export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  categoryId: text('category_id'),
  roomId: text('room_id'),
  price: real('price'),
  quantity: integer('quantity').notNull().default(1),
  description: text('description'),
  imageUrl: text('image_url'),
  favorite: integer('favorite', { mode: 'boolean' }).notNull().default(false),
  date: text('date'),
  createdAt: text('created_at').notNull(),
  userId: text('user_id').notNull(),
})

export type User = typeof users.$inferSelect
export type Category = typeof categories.$inferSelect
export type Room = typeof rooms.$inferSelect
export type Item = typeof items.$inferSelect
export type NewItem = typeof items.$inferInsert
