import Joi from 'joi'

const userSchema = Joi.object({
  username: Joi.string().alphanum().min(1).max(10).required(),
  password: Joi.string()
    .pattern(/^[\S]{6,12}$/)
    .required()
})

export default userSchema
