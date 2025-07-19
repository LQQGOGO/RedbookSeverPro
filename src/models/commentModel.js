import db from '../config/db.js'
import UserModel from './userModel.js'

class CommentModel {
  //获取文章的评论
  static async getComments(articleId) {
    try {
    //   console.log('articleId', articleId)
      const [comments] = await db.query(
        'SELECT * FROM comments WHERE article_id = ?',
        [articleId]
      )
      console.log('comments', comments)
      if (comments.length === 0) {
        return {
          message: '文章没有评论',
          data: []
        }
      }

      //通过用户id查询用户信息
      const user = await UserModel.findById(comments[0].user_id)

      const commentsWithUser = comments.map(comment => ({
        ...comment,
        user
      }))
      return {
        message: '获取文章的评论成功',
        data: commentsWithUser
      }
    } catch (error) {
      throw new Error('获取文章的评论失败', error)
    }
  }

  //发布评论
  static async createComment(commentData) {
    try {
    //   console.log('commentData', commentData)
      const [comment] = await db.query(
        'INSERT INTO comments (article_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)',
        [commentData.articleId, commentData.userId, commentData.content, null]
      )
      console.log('comment', comment)
      return {
        message: '发布评论成功',
        data: {
          insertId: comment.insertId
        }
      }
    } catch (error) {
        console.error('数据库错误:', error)
      throw new Error('发布评论失败', error)
    }
  }
}

export default CommentModel
