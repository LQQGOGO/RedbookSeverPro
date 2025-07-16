import ArticleModel from '../models/articleModel.js'

const getArticleList = async ctx => {
  try {
    const { userId, category, title, content } = ctx.request.body
    console.log('ctx.request.body', ctx.request.body)
    
    const articles = await ArticleModel.getAll({ userId, category, title, content })
    ctx.body = {
      code: 200,
      message: '获取文章列表成功',
      data: articles
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      message: '获取文章列表失败',
      error: error.message
    }
  }
}

export default {
  getArticleList
}