import db from '../config/db.js'
import bcrypt from 'bcrypt'

class UserModel {
  static async register(userData) {
    try {
      const { username, password } = userData
      console.log(username, password)

      const hashedPassword = await bcrypt.hash(password, 10)
      const [result] = await db.execute(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword]
      )
      return result
    } catch (error) {
      throw new Error('注册失败', error)
    }
  }
}

export default UserModel
