import mysql from 'mysql2/promise'
import process from 'process'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

// 测试连接
pool.query('SELECT 1')
  .then(() => console.log('数据库连接成功'))
  .catch(err => console.error('数据库连接失败:', err));

export default pool