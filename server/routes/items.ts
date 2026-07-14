import { Hono } from 'hono'
import { db } from '../db/index.ts'
import { items } from '../db/schema.ts'
import { eq, desc, like, or } from 'drizzle-orm'

export const itemsRouter = new Hono()

// 获取所有物品（支持按分类、房间筛选，支持关键词搜索）
itemsRouter.get('/', (c) => {
  const categoryId = c.req.query('categoryId')
  const roomId = c.req.query('roomId')
  const keyword = c.req.query('keyword')
  const favorite = c.req.query('favorite')

  let query = db.select().from(items).$dynamic()

  if (categoryId) query = query.where(eq(items.categoryId, categoryId))
  if (roomId) query = query.where(eq(items.roomId, roomId))
  if (favorite === 'true') query = query.where(eq(items.favorite, true))
  if (keyword) query = query.where(
    or(like(items.name, `%${keyword}%`), like(items.description, `%${keyword}%`))
  )

  const result = query.orderBy(desc(items.createdAt)).all()
  return c.json(result)
})

// 获取单个物品
itemsRouter.get('/:id', (c) => {
  const id = c.req.param('id')
  const item = db.select().from(items).where(eq(items.id, id)).get()
  if (!item) return c.json({ error: '物品不存在' }, 404)
  return c.json(item)
})

// 新增物品
itemsRouter.post('/', async (c) => {
  const body = await c.req.json()
  if (!body.name) return c.json({ error: '缺少 name' }, 400)

  const newItem = {
    id: Date.now().toString(),
    name: body.name,
    categoryId: body.categoryId ?? null,
    roomId: body.roomId ?? null,
    price: body.price ?? null,
    quantity: body.quantity ?? 1,
    description: body.description ?? null,
    imageUrl: body.imageUrl ?? null,
    favorite: false,
    createdAt: new Date().toISOString(),
  }
  db.insert(items).values(newItem).run()
  return c.json(newItem, 201)
})

// 更新物品
itemsRouter.put('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()

  const existing = db.select().from(items).where(eq(items.id, id)).get()
  if (!existing) return c.json({ error: '物品不存在' }, 404)

  db.update(items).set(body).where(eq(items.id, id)).run()
  const updated = db.select().from(items).where(eq(items.id, id)).get()
  return c.json(updated)
})

// 切换收藏
itemsRouter.patch('/:id/favorite', (c) => {
  const id = c.req.param('id')
  const item = db.select().from(items).where(eq(items.id, id)).get()
  if (!item) return c.json({ error: '物品不存在' }, 404)

  db.update(items).set({ favorite: !item.favorite }).where(eq(items.id, id)).run()
  return c.json({ favorite: !item.favorite })
})

// 删除物品
itemsRouter.delete('/:id', (c) => {
  const id = c.req.param('id')
  db.delete(items).where(eq(items.id, id)).run()
  return c.json({ success: true })
})
