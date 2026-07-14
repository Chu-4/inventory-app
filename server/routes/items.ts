import { Hono } from 'hono'
import { db } from '../db/index.ts'
import { items } from '../db/schema.ts'
import { eq, desc, like, or, and } from 'drizzle-orm'

export const itemsRouter = new Hono()

itemsRouter.get('/', (c) => {
  const userId = c.get('userId' as never) as string
  const categoryId = c.req.query('categoryId')
  const roomId = c.req.query('roomId')
  const keyword = c.req.query('keyword')
  const favorite = c.req.query('favorite')

  let query = db.select().from(items).where(eq(items.userId, userId)).$dynamic()

  if (categoryId) query = query.where(and(eq(items.userId, userId), eq(items.categoryId, categoryId)))
  if (roomId) query = query.where(and(eq(items.userId, userId), eq(items.roomId, roomId)))
  if (favorite === 'true') query = query.where(and(eq(items.userId, userId), eq(items.favorite, true)))
  if (keyword) query = query.where(and(eq(items.userId, userId), or(like(items.name, `%${keyword}%`), like(items.description, `%${keyword}%`))))

  const result = query.orderBy(desc(items.createdAt)).all()
  return c.json(result)
})

itemsRouter.get('/:id', (c) => {
  const userId = c.get('userId' as never) as string
  const id = c.req.param('id')
  const item = db.select().from(items).where(and(eq(items.id, id), eq(items.userId, userId))).get()
  if (!item) return c.json({ error: '物品不存在' }, 404)
  return c.json(item)
})

itemsRouter.post('/', async (c) => {
  const userId = c.get('userId' as never) as string
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
    userId,
  }
  db.insert(items).values(newItem).run()
  return c.json(newItem, 201)
})

itemsRouter.put('/:id', async (c) => {
  const userId = c.get('userId' as never) as string
  const id = c.req.param('id')
  const body = await c.req.json()

  const existing = db.select().from(items).where(and(eq(items.id, id), eq(items.userId, userId))).get()
  if (!existing) return c.json({ error: '物品不存在' }, 404)

  db.update(items).set(body).where(and(eq(items.id, id), eq(items.userId, userId))).run()
  const updated = db.select().from(items).where(eq(items.id, id)).get()
  return c.json(updated)
})

itemsRouter.patch('/:id/favorite', (c) => {
  const userId = c.get('userId' as never) as string
  const id = c.req.param('id')
  const item = db.select().from(items).where(and(eq(items.id, id), eq(items.userId, userId))).get()
  if (!item) return c.json({ error: '物品不存在' }, 404)

  db.update(items).set({ favorite: !item.favorite }).where(eq(items.id, id)).run()
  return c.json({ favorite: !item.favorite })
})

itemsRouter.delete('/:id', (c) => {
  const userId = c.get('userId' as never) as string
  const id = c.req.param('id')
  db.delete(items).where(and(eq(items.id, id), eq(items.userId, userId))).run()
  return c.json({ success: true })
})
