import { Hono } from 'hono'
import { db } from '../db/index.ts'
import { categories } from '../db/schema.ts'
import { eq, and } from 'drizzle-orm'

export const categoriesRouter = new Hono()

categoriesRouter.get('/', (c) => {
  const userId = c.get('userId' as never) as string
  const result = db.select().from(categories).where(eq(categories.userId, userId)).all()
  return c.json(result)
})

categoriesRouter.post('/', async (c) => {
  const userId = c.get('userId' as never) as string
  const { name, color, parentId } = await c.req.json()
  if (!name || !color) return c.json({ error: '缺少 name 或 color' }, 400)

  const newCategory = { id: Date.now().toString(), name, color, parentId: parentId ?? null, userId }
  db.insert(categories).values(newCategory).run()
  return c.json(newCategory, 201)
})

categoriesRouter.delete('/:id', (c) => {
  const userId = c.get('userId' as never) as string
  const id = c.req.param('id')
  db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId))).run()
  return c.json({ success: true })
})
