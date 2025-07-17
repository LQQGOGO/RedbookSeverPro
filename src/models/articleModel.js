import db from '../config/db.js'
import UserModel from './userModel.js'

class ArticleModel {
  //获取文章列表
  static async getAll(options = {}) {
    try {
      // 1. 查询文章列表（不包含用户详细信息）
      let query = `
      SELECT 
        a.id, a.title, a.cover, a.cover_width, a.cover_height, 
        a.like_count, a.collect_count, a.created_at,
        a.user_id
      FROM articles a
      WHERE 1=1
    `

      let params = []
      const { userId, category, title, content } = options

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

      const [articles] = await db.query(query, params)

      // 2. 收集所有 user_id 并去重
      const userIds = [...new Set(articles.map(article => article.user_id))]

      // 3. 批量查询用户信息
      const users = await UserModel.findByIds(userIds)
      const userIdToUser = users.reduce((map, user) => {
        map[user.id] = user
        return map
      }, {})

      // 4. 将用户信息合并到文章中
      const articlesWithUser = articles.map(article => ({
        ...article,
        user: {
          username: userIdToUser[article.user_id]?.username || '',
          avatar: userIdToUser[article.user_id]?.avatar || '',
          nickname: userIdToUser[article.user_id]?.nickname || ''
        }
      }))

      return {
        articles: articlesWithUser
      }
    } catch (error) {
      console.error('获取文章列表失败:', error)
      throw new Error(`获取文章列表失败: ${error.message}`)
    }
  }

  //获取文章详情
  static async getById(id) {
    try {
      const [result] = await db.query('SELECT * FROM articles WHERE id = ?', [
        id
      ])
      return result[0]
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
        [title, content, userId, category, mediaUrls, mediaType, cover, coverHeight, coverWidth]
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
}

export default ArticleModel
