import db from '../config/db.js'
import bcrypt from 'bcrypt'

class UserModel {
  //创建新用户
  static async register(userData) {
    try {
      const { username, password } = userData

      //查询用户是否存在
      const [user] = await db.query('SELECT * FROM users WHERE username = ?', [
        username
      ])
      if (user.length > 0) {
        throw new Error('用户已存在')
      }

      const defaultAvatar =
        'https://img0.baidu.com/it/u=221171848,1966442967&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'

      const hashedPassword = await bcrypt.hash(password, 10)
      const nickname = '用户' + username

      const [result] = await db.query(
        'INSERT INTO users (username, password, avatar, bio, created_at, nickname) VALUES (?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, defaultAvatar, '', new Date(), nickname]
      )
      return result
    } catch (error) {
      throw new Error(error.message || '注册失败')
    }
  }
  //通过用户名查询用户
  static async findByUsername(username) {
    try {
      const [result] = await db.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      )
      return result[0]
    } catch (error) {
      throw new Error('查询用户失败', error)
    }
  }
  //比较密码
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword)
  }
  //通过用户id查询用户
  static async findById(id) {
    try {
      const [result] = await db.query('SELECT * FROM users WHERE id = ?', [id])
      return result[0]
    } catch (error) {
      throw new Error('查询用户失败', error)
    }
  }
  //通过用户id批量查询用户
  static async findByIds(ids) {
    try {
      const [result] = await db.query('SELECT * FROM users WHERE id IN (?)', [
        ids
      ])
      return result
    } catch (error) {
      throw new Error('批量查询用户失败', error)
    }
  }

  //通过id查找点赞过的文章
  static async findLikedArticles(userId) {
    try {
      const [result] = await db.query(
        'SELECT * FROM articles WHERE id IN (SELECT article_id FROM likes WHERE user_id = ?)',
        [userId]
      )
      if (result.length === 0) {
        return {
          message: '没有点赞过的文章',
          data: []
        }
      }
      return {
        total: result.length,
        data: result
      }
    } catch (error) {
      throw new Error('查询点赞过的文章失败', error)
    }
  }

  //通过id查找收藏过的文章
  static async findCollectedArticles(userId) {
    try {
      const [result] = await db.query('SELECT * FROM articles WHERE id IN (SELECT article_id FROM favorites WHERE user_id = ?)', [userId])
      if (result.length === 0) {
        return {
          message: '没有收藏过的文章',
          data: []
        }
      }
      return {
        total: result.length,
        data: result
      }
    } catch (error) {
      throw new Error('查询收藏过的文章失败', error)
    }
  }
}

export default UserModel
