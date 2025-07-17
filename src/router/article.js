import Router from 'koa-router'

const router = new Router()

//导入文章路由处理函数
import article_handler from '../handler/article.js'

router.get('/article/list', article_handler.getArticleList)
router.post('/article/publish', article_handler.publishArticle)

export default router