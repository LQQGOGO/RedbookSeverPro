import Router from 'koa-router'
import upload_handler from '../handler/upload.js'
import { normalUpload, chunkUpload } from '../utils/upload.js'

const router = new Router()


router.post('/upload/image', normalUpload.single('image'), upload_handler.uploadImage)
router.post('/upload/video', chunkUpload.single('video'), upload_handler.uploadVideo)
router.get('/upload/video/status', upload_handler.getVideoStatus)
router.post('/upload/video/merge', upload_handler.mergeVideo)

export default router