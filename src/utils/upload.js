//上传工具
import fs from 'fs'
import path from 'path'
import multer from 'koa-multer'

import dotenv from 'dotenv'
import process from 'process'
dotenv.config()


//创建文件夹
const uploadDir = path.join(process.env.BASE_URL, 'upload')
fs.mkdir(uploadDir, { recursive: true }, (err) => {
  if(err) {
    console.error('创建文件夹失败', err)
  }
})

//配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //根据文件类型确定目录
    let targetDir = uploadDir

    if(file.mimetype.startsWith('image/')) {
      targetDir = path.join(uploadDir, 'images')
    } else if(file.mimetype.startsWith('video/')) {
      targetDir = path.join(uploadDir, 'videos')
    }

    if(!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }
    cb(null, targetDir)
  },
  filename: (req, file, cb) => {
    //生成唯一文件名
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${file.mimetype.split('/')[1]}`
    cb(null, fileName)
  }
})

const upload = multer({ storage })

export default upload