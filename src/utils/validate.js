const validate = (schema) => {
  return async (ctx, next) => {
    const data = ctx.request.body
    console.log('收到参数', data)
    const { error } = schema.validate(data, {
      abortEarly: false
    })

    if (error) {
      ctx.status = 400
      ctx.body = {
        message: '数据格式错误',
        details: error.details.map(err => err.message)
      }
      return
    }

    await next()
  }
}

export default validate