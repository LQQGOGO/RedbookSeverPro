import UserModel from '../models/userModel.js'

const register = async ctx => {
  try {
    const { username, password } = ctx.request.body
    const result = await UserModel.register({ username, password })
    ctx.body = {
      code: 200,
      message: '注册成功',
      data: result
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      message: '注册失败',
      error: error.message
    }
  }
}

export default {
  register
}