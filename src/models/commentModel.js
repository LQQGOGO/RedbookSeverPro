import db from '../config/db.js'

class CommentModel {
  //获取文章的评论
  static async getComments(articleId) {
    try {
      const [comments] = await db.query(
        'SELECT * FROM comments WHERE article_id = ?',
        [articleId]
      )
      if (comments.length === 0) {
        return {
          message: '文章没有评论',
          data: []
        }
      }
      return {
        message: '获取文章的评论成功',
        data: comments
      }
    } catch (error) {
      throw new Error('获取文章的评论失败', error)
    }
  }

  //发布评论
  static async createComment(commentData) {
    try {
      const [comment] = await db.query(
        'INSERT INTO comments (article_id, user_id, content) VALUES (?, ?, ?)',
        [commentData.articleId, commentData.userId, commentData.content]
      )
      return {
        message: '发布评论成功',
        data: {
          insertId: comment.insertId
        }
      }
    } catch (error) {
      throw new Error('发布评论失败', error)
    }
  }
}

export default CommentModel
