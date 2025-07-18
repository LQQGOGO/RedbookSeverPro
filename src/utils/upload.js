import fs from 'fs-extra'
import path from 'path'
import multer from '@koa/multer'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 创建基础目录
const BASE_DIR = path.join(__dirname, '../../upload')
const TEMP_DIR = path.join(BASE_DIR, 'temp')
const IMAGE_DIR = path.join(BASE_DIR, 'images')
const VIDEO_DIR = path.join(BASE_DIR, 'videos')

// 确保目录存在
fs.ensureDirSync(BASE_DIR)
fs.ensureDirSync(TEMP_DIR)
fs.ensureDirSync(IMAGE_DIR)
fs.ensureDirSync(VIDEO_DIR)

// 普通文件上传配置（图片）
const normalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let targetDir = IMAGE_DIR

    if (file.mimetype.startsWith('video/')) {
      targetDir = VIDEO_DIR
    }

    cb(null, targetDir)
  },
  filename: (req, file, cb) => {
    // 使用原始文件名 + 时间戳避免冲突
    const ext = path.extname(file.originalname)
    const baseName = path.basename(file.originalname, ext)
    const fileName = `${baseName}-${Date.now()}${ext}`
    cb(null, fileName)
  }
})

// 分片上传配置（视频）
const chunkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 从请求中获取文件哈希，用于创建临时目录
    // console.log('file', file )
    // console.log('req.body', req.body)

    // const { fileHash } = req.body

    const [fileHash, chunkIndex, originalName] = file.originalname.split('|')
    // console.log('fileHash', fileHash)
    // console.log('chunkIndex', chunkIndex)
    // console.log('originalName', originalName)

    if (!fileHash) {
      return cb(new Error('缺少 fileHash 参数'), null)
    }

    const chunkDir = path.join(TEMP_DIR, fileHash)
    fs.ensureDirSync(chunkDir)

    cb(null, chunkDir)
  },
  filename: (req, file, cb) => {
    // 使用文件哈希 + 分片索引作为文件名
    const [fileHash, chunkIndex, originalName] = file.originalname.split('|')
    // const { chunkIndex } = req.body

    if (chunkIndex === undefined) {
      return cb(new Error('缺少 chunkIndex 参数'), null)
    }

    const ext = path.extname(file.originalname)
    const fileName = `${chunkIndex}${ext}`
    cb(null, fileName)
  }
})

// 创建两个上传中间件实例
export const normalUpload = multer({ storage: normalStorage })
export const chunkUpload = multer({ storage: chunkStorage })
