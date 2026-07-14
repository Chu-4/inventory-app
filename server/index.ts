import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRouter } from './routes/auth.ts'
import { categoriesRouter } from './routes/categories.ts'
import { roomsRouter } from './routes/rooms.ts'
import { itemsRouter } from './routes/items.ts'
import { authMiddleware } from './middleware/auth.ts'
import './db/migrate.ts'

const app = new Hono()

app.use('/api/*', cors())

// 不需要登录的接口
app.route('/api/auth', authRouter)

// 需要登录的接口，统一加中间件
app.use('/api/*', authMiddleware)
app.route('/api/categories', categoriesRouter)
app.route('/api/rooms', roomsRouter)
app.route('/api/items', itemsRouter)

app.get('/api/health', (c) => c.json({ status: 'ok' }))

const PORT = 3001
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`后端运行在 http://localhost:${PORT}`)
})
