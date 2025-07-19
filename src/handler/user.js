import UserModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import process from 'process'
import dotenv from 'dotenv'
dotenv.config()

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

const login = async ctx => {
  try {
    const { username, password } = ctx.request.body
    const user = await UserModel.findByUsername(username)
    if (!user) {
      ctx.body = {
        code: 401,
        message: '用户不存在'
      }
      return
    }
    const isPasswordValid = await UserModel.comparePassword(password, user.password)
    if (!isPasswordValid) {
      ctx.body = {
        code: 401,
        message: '密码错误'
      }
      return
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
    ctx.body = {
      code: 200,
      message: '登录成功',
      data: { token, userId: user.id }
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      message: '登录失败',
      error: error.message
    }
  }
}

const getLikedArticles = async ctx => {
  try {
    const { userId } = ctx.request.body
    const articles = await UserModel.findLikedArticles(userId)
    ctx.body = {
      code: 200,
      message: '查询点赞过的文章成功',
      data: articles
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      message: '查询点赞过的文章失败',
      error: error.message
    }
  }

}

const getCollectedArticles = async ctx => {
  try {
    const { userId } = ctx.request.body
    const articles = await UserModel.findCollectedArticles(userId)
    ctx.body = {
      code: 200,
      message: '查询收藏过的文章成功',
      data: articles
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      message: '查询收藏过的文章失败',
      error: error.message
    }
  }
}

export default {
  register,
  login,
  getLikedArticles,
  getCollectedArticles
}