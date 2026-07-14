import { Hono } from 'hono'
import { db } from '../db/index.ts'
import { rooms } from '../db/schema.ts'
import { eq, and } from 'drizzle-orm'

export const roomsRouter = new Hono()

roomsRouter.get('/', (c) => {
  const userId = c.get('userId' as never) as string
  const result = db.select().from(rooms).where(eq(rooms.userId, userId)).all()
  return c.json(result)
})

roomsRouter.post('/', async (c) => {
  const userId = c.get('userId' as never) as string
  const { name, icon = 'living' } = await c.req.json()
  if (!name) return c.json({ error: '缺少 name' }, 400)

  const newRoom = { id: Date.now().toString(), name, icon, userId }
  db.insert(rooms).values(newRoom).run()
  return c.json(newRoom, 201)
})

roomsRouter.delete('/:id', (c) => {
  const userId = c.get('userId' as never) as string
  const id = c.req.param('id')
  db.delete(rooms).where(and(eq(rooms.id, id), eq(rooms.userId, userId))).run()
  return c.json({ success: true })
})
