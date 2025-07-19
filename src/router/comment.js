import Router from 'koa-router'
import comment_handler from '../handler/comment.js'

const router = new Router()

router.post('/comment/create', comment_handler.createComment)
router.get('/comment/list', comment_handler.getComments)

export default router