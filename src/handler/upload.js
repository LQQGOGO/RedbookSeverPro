// import process from 'process'
// import dotenv from 'dotenv'
// import { log } from 'console'
// dotenv.config()

// const uploadImage = async ctx => {
//   try {
//     if(!ctx.file) {
//       ctx.body = {
//         code: 400,
//         message: '请上传图片'
//       }
//       return
//     }
//     //返回文件路径
//     const relativePath = `/upload/images/${ctx.file.filename}`
//     const baseUrl = process.env.BASE_URL
//     const fullUrl = `${baseUrl}${relativePath}`
//     ctx.body = {
//       code: 200,
//       message: '图片上传成功',
//       url: fullUrl
//     }
//   } catch (error) {
//     ctx.body = {
//       code: 500,
//       message: '图片上传失败'
//     }
//   }
// }

// const uploadVideo = async ctx => {
//   try {
//     if(!ctx.file) {
//       ctx.body = {
//         code: 400,
//         message: '请上传视频'
//       }
//       return
//     }
//     //返回文件路径
//     const relativePath = `/upload/videos/${ctx.file.filename}`
//     const baseUrl = process.env.BASE_URL
//     const fullUrl = `${baseUrl}${relativePath}`
//     ctx.body = {
//       code: 200,
//       message: '视频上传成功',
//       url: fullUrl
//     }
//   } catch (error) {
//     ctx.body = {
//       code: 500,
//       message: '视频上传失败'
//     }
//   }
// }

// export default {
//   uploadImage,
//   uploadVideo
// }

import fs from 'fs-extra'
import path from 'path'
import crypto from 'crypto'
import dotenv from 'dotenv'
dotenv.config()

const TEMP_DIR = path.join(process.cwd(), 'upload/temp')
const UPLOAD_DIR = path.join(process.cwd(), 'upload/videos')

// 确保目录存在
fs.ensureDirSync(TEMP_DIR)
fs.ensureDirSync(UPLOAD_DIR)

const uploadImage = async ctx => {
  try {
    if(!ctx.file) {
      ctx.body = {
        code: 400,
        message: '请上传图片'
      }
      return
    }
    //返回文件路径
    const relativePath = `/upload/images/${ctx.file.filename}`
    const baseUrl = process.env.BASE_URL
    const fullUrl = `${baseUrl}${relativePath}`
    ctx.body = {
      code: 200,
      message: '图片上传成功',
      url: fullUrl
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      message: '图片上传失败'
    }
  }
}

// 检查已上传的切片
const getVideoStatus = async ctx => {
  try {
    const { fileHash } = ctx.query
    if (!fileHash) {
      ctx.body = { code: 400, message: '缺少fileHash参数' }
      return
    }

    // 创建以fileHash命名的临时目录
    const chunkDir = path.join(TEMP_DIR, fileHash)
    const exists = await fs.pathExists(chunkDir)

    if (!exists) {
      ctx.body = { code: 200, uploaded: [] }
      return
    }

    // 读取目录下的所有文件
    const files = await fs.readdir(chunkDir)
    const uploadedChunks = files
      .filter(file => file.startsWith(fileHash))
      .map(file => {
        // 从文件名中提取切片索引
        const matches = file.match(/_(\d+)\.part$/)
        return matches ? parseInt(matches[1]) : -1
      })
      .filter(index => index !== -1)
      .sort((a, b) => a - b)

    ctx.body = { code: 200, uploaded: uploadedChunks }
  } catch (error) {
    console.error('检查切片状态失败:', error)
    ctx.body = { code: 500, message: '服务器错误' }
  }
}

// 上传单个切片
const uploadVideo = async ctx => {
  try {
    if (!ctx.file) {
      ctx.body = { code: 400, message: '缺少文件' }
      return
    }

    const [fileHash, chunkIndex, originalName] = ctx.file.originalname.split('|')
    // // const { fileHash, chunkIndex } = ctx.file.originalname.split('|')
    if (!fileHash || chunkIndex === undefined) {
      ctx.body = { code: 400, message: '缺少必要参数' }
      return
    }
    // console.log('fileHash', fileHash)
    // console.log('chunkIndex', chunkIndex)
    // console.log('originalName', originalName)

    // 创建以fileHash命名的临时目录
    const chunkDir = path.join(TEMP_DIR, fileHash)
    await fs.ensureDir(chunkDir)

    // 重命名并移动文件到临时目录
    const chunkPath = path.join(chunkDir, `${fileHash}_${chunkIndex}.part`)
    await fs.move(ctx.file.path, chunkPath, { overwrite: true })

    ctx.body = { code: 200, message: '切片上传成功' }
  } catch (error) {
    console.error('上传切片失败:', error)
    ctx.body = { code: 500, message: '服务器错误' }
  }
}

// 合并所有切片
const mergeVideo = async ctx => {
  try {
    const { fileHash, fileName, totalChunks } = ctx.request.body
    // console.log('fileHash', fileHash)
    // console.log('fileName', fileName)
    // console.log('totalChunks', totalChunks)
    if (!fileHash || !fileName || !totalChunks) {
      ctx.body = { code: 400, message: '缺少必要参数' }
      return  
    }

    const chunkDir = path.join(TEMP_DIR, fileHash)
    const targetPath = path.join(UPLOAD_DIR, fileName)

    // 检查所有切片是否都已上传
    const files = await fs.readdir(chunkDir)
    const uploadedChunks = files
      .filter(file => file.startsWith(fileHash))
      .map(file => {
        const matches = file.match(/_(\d+)\.part$/)
        return matches ? parseInt(matches[1]) : -1
      })
      .filter(index => index !== -1)

    if (uploadedChunks.length !== totalChunks) {
      ctx.body = {
        code: 400,
        message: `切片不完整，需要${totalChunks}个，已上传${uploadedChunks.length}个`
      }
      return
    }

    // 创建可写流
    const writeStream = fs.createWriteStream(targetPath)

    // 按顺序合并切片
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(chunkDir, `${fileHash}_${i}.part`)
      const readStream = fs.createReadStream(chunkPath)

      await new Promise((resolve, reject) => {
        readStream.on('end', resolve)
        readStream.on('error', reject)
        readStream.pipe(writeStream, { end: i === totalChunks - 1 })
      })

      // 删除已合并的切片
      await fs.remove(chunkPath)
    }

    // 验证合并后的文件MD5
    const fileHashCheck = await calculateFileHash(targetPath)
    if (fileHashCheck !== fileHash) {
      await fs.remove(targetPath)
      ctx.body = { code: 500, message: '文件合并后MD5校验失败' }
      return
    }

    // 删除临时目录
    await fs.remove(chunkDir)

    // 返回文件URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:3050'
    const fileUrl = `${baseUrl}/upload/videos/${fileName}`

    ctx.body = {
      code: 200,
      message: '文件合并成功',
      url: fileUrl
    }
  } catch (error) {
    console.error('合并文件失败:', error)
    ctx.body = { code: 500, message: '服务器错误' }
  }
}

// 计算文件的MD5哈希值
const calculateFileHash = async filePath => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5')
    const stream = fs.createReadStream(filePath)

    stream.on('data', chunk => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

export default {
  uploadImage,
  uploadVideo,
  getVideoStatus,
  mergeVideo
}