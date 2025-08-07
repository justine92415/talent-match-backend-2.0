import request from 'supertest'
import app from '../app'

describe('Ping API', () => {
  it('GET /api/ping 應回傳 { message: "pong" }', async () => {
    const res = await request(app).get('/api/ping')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ message: 'pong' })
  })
})
