import CommentModel from '../models/commentModel.js'

//发布评论
const createComment = async ctx => {
    try {
        const { articleId, userId, content } = ctx.request.body
        console.log('articleId', articleId, 'userId', userId, 'content', content)
        const comment = await CommentModel.createComment({ articleId, userId, content })
        ctx.body = {
            code: 200,
            message: '发布评论成功',
            data: comment
        }
    } catch (error) {
        ctx.body = {
            code: 500,
            message: '发布评论失败',
            error: error.message
        }
    }
}

//获取文章的评论
const getComments = async ctx => {
    try {
        const { articleId } = ctx.query
        // console.log('articleId', articleId)
        const comments = await CommentModel.getComments(articleId)
        ctx.body = {
            code: 200,
            message: '获取文章的评论成功',
            data: comments
        }
    } catch (error) {
        ctx.body = {
            code: 500,
            message: '获取文章的评论失败',
            error: error.message
        }
    }
}

export default {
    createComment,
    getComments
}