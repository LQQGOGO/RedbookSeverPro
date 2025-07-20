import Router from 'koa-router'
import validate from '../utils/validate.js'
const router = new Router()

//导入用户路由处理函数
import user_handler from '../handler/user.js'

//导入用户验证规则
import userSchema from '../schema/user.js'

router.post('/user/register', validate(userSchema), user_handler.register)
router.post('/user/login', validate(userSchema), user_handler.login)
router.get('/user/liked', user_handler.getLikedArticles)
router.get('/user/collected', user_handler.getCollectedArticles)
router.get('/user/info', user_handler.getUserInfo)

export default router
