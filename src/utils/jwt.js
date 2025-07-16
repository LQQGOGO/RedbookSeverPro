import jwt from 'koa-jwt'
import process from 'process'
import dotenv from 'dotenv'
dotenv.config()

const jwtMiddleware = jwt({
  secret: process.env.JWT_SECRET
}).unless({
  path: ['/user/register', '/user/login']
})

export default jwtMiddleware