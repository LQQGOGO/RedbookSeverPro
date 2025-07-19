import Router from 'koa-router'

const router = new Router()

//导入文章路由处理函数
import article_handler from '../handler/article.js'

router.get('/article/list', article_handler.getArticleList)
router.post('/article/publish', article_handler.publishArticle)
router.post('/article/like', article_handler.likeArticle)
router.post('/article/cancel_like', article_handler.cancelLikeArticle)
router.post('/article/collect', article_handler.collectArticle)
router.post('/article/cancel_collect', article_handler.cancelCollectArticle)
router.get('/article/detail', article_handler.getArticleDetail)
router.get('/article/did_liked', article_handler.didLiked)
router.get('/article/did_collected', article_handler.didCollected)

export default router