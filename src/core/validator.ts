import Koa from 'koa'

import {
  Rule,
  Validator as BaseValidator,
  ValidatorParams
} from '@src/helper/validator'
import User from '@src/models/user'
import { ParameterException } from '@src/core/http-exception'

export class SigninValidator extends BaseValidator {
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
        min: 64,
        max: 64
      })
    ]
  }
}

export class SignupValidator extends BaseValidator {
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
        min: 64,
        max: 64
      })
    ]
    this.password2 = [
      new Rule('isLength', '密码不符合长度要求', {
        min: 64,
        max: 64
      })
    ]
  }

  // 自定义字段验证
  validatePassword(values: ValidatorParams) {
    const password1 = values.body.password
    const password2 = values.body.password1
    if (password1 !== password2) {
      return new ParameterException('两次密码不一致')
    }
  }

  async validateUsername(values: ValidatorParams) {
    const username = values.body.username
    const user = await User.findOne({
      where: {
        username
      }
    })
    if (!user) {
      return new ParameterException('账户不存在')
    }
  }
}
