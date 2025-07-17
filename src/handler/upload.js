import process from 'process'
import dotenv from 'dotenv'
dotenv.config()

const uploadImage = async ctx => {
  try {
    if(!ctx.request.files || !ctx.request.files.file) {
      ctx.body = {
        code: 400,
        message: '请上传图片'
      }
      return
    }
    //返回文件路径
    const relativePath = `/upload/images/${ctx.request.files.file.filename}`
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

const uploadVideo = async ctx => {
  console.log('uploadVideo')
}

export default {
  uploadImage,
  uploadVideo
}