import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core'

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  parentId: text('parent_id'), // 用于子分类，如"同人本"属于"书籍"
})

export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull().default('living'),
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
  createdAt: text('created_at').notNull(),
})

// 推导出 TS 类型，后续路由里直接用
export type Category = typeof categories.$inferSelect
export type Room = typeof rooms.$inferSelect
export type Item = typeof items.$inferSelect
export type NewItem = typeof items.$inferInsert
