import Koa from 'koa'
import { Rule, Validator } from '@src/helper/validator'

export class SigninValidator extends Validator {
  constructor(ctx: Koa.Context) {
    super(ctx)
    this.username = [
      new Rule('isLength', '用户名不符合长度要求', {
        min: 6,
        max: 16
      }),
      new Rule('matches', '用户名不符合格式要求', /^[a-zA-Z0-9_-]{6,16}$/)
    ]
    this.password = [
      new Rule('isLength', '密码不符合长度要求', {
        min: 6,
        max: 16
      })
    ]
  }
}
