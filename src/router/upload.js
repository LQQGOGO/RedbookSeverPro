import Router from 'koa-router'
import upload_handler from '../handler/upload'
import upload from '../utils/upload'

const router = new Router()


router.post('/upload/image', upload.single('image'), upload_handler.uploadImage)
router.post('/upload/video', upload.single('video'), upload_handler.uploadVideo)

export default router