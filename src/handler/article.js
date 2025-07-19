import ArticleModel from '../models/articleModel.js'

const getArticleList = async ctx => {
  try {
    const {
      userId,
      category,
      title,
      content,
      page = 1,
      pageSize = 20
    } = ctx.query
    // console.log('ctx', ctx.query)

    const articles = await ArticleModel.getAll({ userId, category, title, content, page, pageSize })
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

//发布文章
const publishArticle = async ctx => {
  try {
    const { userId, title, content, category, mediaUrls, mediaType, cover, coverHeight, coverWidth} = ctx.request.body
    console.log({ userId, title, content, category, mediaUrls, mediaType, cover, coverHeight, coverWidth })
    const article = await ArticleModel.createArticle({ userId, title, content, category, mediaUrls, mediaType, cover, coverHeight, coverWidth })
    ctx.body = {
      code: 200,
      message: '发布文章成功',
      data: article
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      message: '发布文章失败',
      error: error.message
    }
  }
}

//获取文章详情
const getArticleDetail = async ctx => {
  try {
    const { id } = ctx.query
    const article = await ArticleModel.getArticleDetail(id)
    ctx.body = {
      code: 200,
      message: '获取文章详情成功',
      data: article
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      message: '获取文章详情失败',
      error: error.message
    }
  }
}

//点赞文章
const likeArticle = async ctx => {
  try {
    const { id, userId } = ctx.request.body
    console.log({ id, userId })
    const article = await ArticleModel.likeArticle(id, userId)
    ctx.body = {
      code: 200,
      message: '点赞文章成功',
      data: article
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      message: '点赞文章失败',
      error: error.message
    }
  }
}

//取消点赞文章
const cancelLikeArticle = async ctx => {
  try {
    const { id, userId } = ctx.request.body
    const article = await ArticleModel.cancelLikeArticle(id, userId)
    ctx.body = {
      code: 200,
      message: '取消点赞文章成功',
      data: article
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      message: '取消点赞文章失败',
      error: error.message
    }
  }
}

//收藏文章
const collectArticle = async ctx => {
  try {
    const { id, userId } = ctx.request.body
    const article = await ArticleModel.collectArticle(id, userId)
    ctx.body = {
      code: 200,
      message: '收藏文章成功',
      data: article
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      message: '收藏文章失败',
      error: error.message
    }
  }
}

//取消收藏文章
const cancelCollectArticle = async ctx => {
  try {
    const { id, userId } = ctx.request.body
    const article = await ArticleModel.cancelCollectArticle(id, userId)
    ctx.body = {
      code: 200,
      message: '取消收藏文章成功',
      data: article
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      message: '取消收藏文章失败',
      error: error.message
    }
  }
}

//通过id查找是否点赞过
const didLiked = async ctx => {
  try {
    const { id, userId } = ctx.query
    console.log('id', id, 'userId', userId)
    const result = await ArticleModel.didLiked(id, userId)
    // console.log('result', result)
    ctx.body = {
      code: 200,
      message: '查询是否点赞过成功',
      data: result
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      message: '查询是否点赞过失败',
      error: error.message
    }
  }
}

//通过id查找是否收藏过
const didCollected = async ctx => {
  try {
    const { id, userId } = ctx.query
    const result = await ArticleModel.didCollect(id, userId)
    // console.log('result', result)
    ctx.body = {
      code: 200,
      message: '查询是否收藏过成功',
      data: result
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      message: '查询是否收藏过失败',
      error: error.message
    }
  }
}

export default {
  getArticleList,
  publishArticle,
  likeArticle,
  cancelLikeArticle,
  collectArticle,
  cancelCollectArticle,
  getArticleDetail,
  didLiked,
  didCollected
}