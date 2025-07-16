import jwt from 'koa-jwt'
import process from 'process'

const jwtMiddleware = jwt({
  secret: process.env.JWT_SECRET
}).unless({
  path: ['/user/register']
})

export default jwtMiddleware