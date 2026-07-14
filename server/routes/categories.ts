import { Hono } from 'hono'
import { db } from '../db/index.ts'
import { categories } from '../db/schema.ts'
import { eq } from 'drizzle-orm'

export const categoriesRouter = new Hono()

// 获取所有分类
categoriesRouter.get('/', (c) => {
  const result = db.select().from(categories).all()
  return c.json(result)
})

// 新增分类
categoriesRouter.post('/', async (c) => {
  const body = await c.req.json()
  const { name, color, parentId } = body
  if (!name || !color) return c.json({ error: '缺少 name 或 color' }, 400)

  const newCategory = {
    id: Date.now().toString(),
    name,
    color,
    parentId: parentId ?? null,
  }
  db.insert(categories).values(newCategory).run()
  return c.json(newCategory, 201)
})

// 删除分类
categoriesRouter.delete('/:id', (c) => {
  const id = c.req.param('id')
  db.delete(categories).where(eq(categories.id, id)).run()
  return c.json({ success: true })
})
