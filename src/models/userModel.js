import db from '../config/db.js'
import bcrypt from 'bcrypt'

class UserModel {
  //创建新用户
  static async register(userData) {
    try {
      const { username, password } = userData
      const defaultAvatar = 'D:/code/Server/RedbookSeverPro/src/assets/01.webp'

      const hashedPassword = await bcrypt.hash(password, 10)

      const [result] = await db.query(
        'INSERT INTO users (username, password, avatar, bio, created_at) VALUES (?, ?, ?, ?, ?)',
        [username, hashedPassword, defaultAvatar, '', new Date()]
      )
      return result
    } catch (error) {
      throw new Error('注册失败', error)
      
    }
  }
  //通过用户名查询用户
  static async findByUsername(username) {
    try {
      console.log(username)
      const [result] = await db.query('SELECT * FROM users WHERE username = ?', [username])
      return result[0]
    } catch (error) {
      throw new Error('查询用户失败', error)
    }
  }
  //比较密码
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword)
  }
}

export default UserModel
