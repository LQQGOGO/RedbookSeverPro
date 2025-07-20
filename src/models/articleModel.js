import db from '../config/db.js'
import UserModel from './userModel.js'

class ArticleModel {
  //获取文章列表
  static async getAll(options = {}) {
    try {
      // 1. 查询文章列表
      let query = `
      SELECT 
        a.id, a.title, a.cover, a.cover_width, a.cover_height, 
        a.like_count, a.collect_count, a.created_at,
        a.user_id
      FROM articles a
      WHERE 1=1
    `

      let params = []
      const {
        userId,
        category = 'recommend',
        title,
        content,
        page = 1,
        pageSize = 20
      } = options

      // 条件筛选
      if (userId) {
        query += ' AND a.user_id = ?'
        params.push(userId)
      }
      if (category) {
        query += ' AND a.category = ?'
        params.push(category)
      }
      if (title) {
        query += ' AND a.title LIKE ?'
        params.push(`%${title}%`)
      }
      if (content) {
        query += ' AND a.content LIKE ?'
        params.push(`%${content}%`)
      }

      // console.log('query', query)
      const [articles] = await db.query(query, params)
      if (articles.length === 0) {
        return {
          data: [],
          message: '无数据',
          total: 0
        }
      }

      const offset = (page - 1) * pageSize
      // const total = articles.length
      const articleList = articles.slice(offset, offset + pageSize)
      // console.log('articles', articles)

      // 2. 收集所有 user_id 并去重
      const userIds = [...new Set(articleList.map(article => article.user_id))]
      if (userIds.length === 0) {
        return {
          data: [],
          message: '无数据',
          total: 0
        }
      }

      // 3. 批量查询用户信息
      const users = await UserModel.findByIds(userIds)
      const userIdToUser = users.reduce((map, user) => {
        map[user.id] = user
        return map
      }, {})

      // 4. 将用户信息合并到文章中
      const articlesWithUser = articleList.map(article => ({
        ...article,

        username: userIdToUser[article.user_id]?.username || '',
        avatar: userIdToUser[article.user_id]?.avatar || '',
        nickname: userIdToUser[article.user_id]?.nickname || ''
      }))

      return {
        message: '获取文章列表成功',
        total: articlesWithUser.length,
        data: articlesWithUser
      }
    } catch (error) {
      console.error('获取文章列表失败:', error)
      throw new Error(`获取文章列表失败: ${error.message}`)
    }
  }

  //获取文章详情
  static async getArticleDetail(id) {
    try {
      const [article] = await db.query('SELECT * FROM articles WHERE id = ?', [
        id
      ])
      if (article.length === 0) {
        return {
          message: '文章不存在',
          data: []
        }
      }
      // console.log('article', article)
      const user = await UserModel.findById(article[0].user_id)
      // console.log('user', user)
      const articleWithUser = {
        ...article[0],
        avatar: user.avatar,
        nickname: user.nickname
      }
      return {
        message: '获取文章详情成功',
        data: articleWithUser
      }
    } catch (error) {
      throw new Error('获取文章详情失败', error)
    }
  }

  //发布文章
  static async createArticle(articleData) {
    try {
      const {
        userId,
        title,
        content,
        category,
        mediaUrls,
        mediaType,
        cover,
        coverHeight,
        coverWidth
      } = articleData
      const [result] = await db.query(
        'INSERT INTO articles (title, content, user_id, category, media_urls, media_type, cover, cover_height, cover_width) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          title,
          content,
          userId,
          category,
          mediaUrls,
          mediaType,
          cover,
          coverHeight,
          coverWidth
        ]
      )
      const [newArticle] = await db.query(
        'SELECT * FROM articles WHERE id = ?',
        [result.insertId]
      )
      return newArticle[0]
    } catch (error) {
      throw new Error('发布文章失败', error)
    }
  }

  //点赞文章
  static async likeArticle(articleId, userId) {
    try {
      const [result1] = await db.query('UPDATE articles SET like_count = like_count + 1 WHERE id = ?', [articleId])
      const [result2] = await db.query('INSERT INTO likes (article_id, user_id) VALUES (?, ?)', [articleId, userId])
      return {
        message: '点赞文章成功',
        data: {
          articleId,
          userId
        }
      }
    } catch (error) {
      throw new Error('点赞文章失败', error)
    }
  }

  //取消点赞文章
  static async cancelLikeArticle(articleId, userId) {
    try {
      const [result1] = await db.query('UPDATE articles SET like_count = like_count - 1 WHERE id = ?', [articleId])
      const [result2] = await db.query('DELETE FROM likes WHERE article_id = ? AND user_id = ?', [articleId, userId])
      return {
        message: '取消点赞文章成功',
        data: {
          articleId,
          userId
        }
      }
    } catch (error) {
      throw new Error('取消点赞文章失败', error)
    }
  }

  //收藏文章
  static async collectArticle(articleId, userId) {
    try {
      const [result1] = await db.query('UPDATE articles SET collect_count = collect_count + 1 WHERE id = ?', [articleId])
      const [result2] = await db.query('INSERT INTO favorites (article_id, user_id) VALUES (?, ?)', [articleId, userId])
      return {
        message: '收藏文章成功',
        data: {
          articleId,
          userId
        }
      }
    } catch (error) {
      throw new Error('收藏文章失败', error)
    }
  }

  //取消收藏文章
  static async cancelCollectArticle(articleId, userId) {
    try {
      const [result1] = await db.query('UPDATE articles SET collect_count = collect_count - 1 WHERE id = ?', [articleId])
      const [result2] = await db.query('DELETE FROM favorites WHERE article_id = ? AND user_id = ?', [articleId, userId])
      return {
        message: '取消收藏文章成功',
        data: {
          articleId,
          userId
        }
      }
    } catch (error) {
      throw new Error('取消收藏文章失败', error)
    }
  }

  //通过id查找是否点赞过
  static async didLiked(articleId, userId) {
    try {
      const [result] = await db.query(
        'SELECT * FROM likes WHERE user_id = ? AND article_id = ?',
        [userId, articleId]
      )
      // console.log('result', result, 'userId', userId, 'articleId', articleId)
      if (result.length === 0) {
        return false
      }
      return true
    } catch (error) {
      throw new Error('查询是否点赞过失败', error)
    }
  }

  //通过id查找是否收藏过
  static async didCollect(articleId, userId) {
    try {
      const [result] = await db.query('SELECT * FROM favorites WHERE user_id = ? AND article_id = ?', [userId, articleId])
      if (result.length === 0) {
        return false
      }
      return true
    } catch (error) {
      throw new Error('查询是否收藏过失败', error)
    }
  }
}

export default ArticleModel
