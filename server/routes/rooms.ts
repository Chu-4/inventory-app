import { Hono } from 'hono'
import { db } from '../db/index.ts'
import { rooms } from '../db/schema.ts'
import { eq } from 'drizzle-orm'

export const roomsRouter = new Hono()

// 获取所有房间
roomsRouter.get('/', (c) => {
  const result = db.select().from(rooms).all()
  return c.json(result)
})

// 新增房间
roomsRouter.post('/', async (c) => {
  const body = await c.req.json()
  const { name, icon = 'living' } = body
  if (!name) return c.json({ error: '缺少 name' }, 400)

  const newRoom = { id: Date.now().toString(), name, icon }
  db.insert(rooms).values(newRoom).run()
  return c.json(newRoom, 201)
})

// 删除房间
roomsRouter.delete('/:id', (c) => {
  const id = c.req.param('id')
  db.delete(rooms).where(eq(rooms.id, id)).run()
  return c.json({ success: true })
})
