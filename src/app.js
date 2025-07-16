import process from 'process'
import dotenv from 'dotenv'
import Koa from 'koa'

dotenv.config()

const app = new Koa()

//引入路由
import userRouter from './router/user.js'
import articleRouter from './router/article.js'

//导入cors中间件
import cors from '@koa/cors'
app.use(cors())

//导入解析表单中间件
import bodyParser from 'koa-bodyparser'
app.use(bodyParser())

//配置解析token中间件
import jwtMiddleware from './utils/jwt.js'
app.use(jwtMiddleware)

//注册路由
app.use(userRouter.routes())
app.use(articleRouter.routes())
//错误处理
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    // Joi 校验错误
    if (err.isJoi) {
      ctx.status = 400
      ctx.body = { message: err.message || '请求参数错误！' }
      return
    }

    // JWT 身份认证失败
    if (err.name === 'UnauthorizedError') {
      ctx.status = 401
      ctx.body = { message: '身份认证失败！' }
      return
    }

    // 其他错误
    ctx.status = 500
    ctx.body = { message: err.message || '服务器内部错误' }
  }
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`)
})
