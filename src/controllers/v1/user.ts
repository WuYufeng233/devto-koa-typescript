import Router from 'koa-router'

import { IUserInfo } from '@src/types'
import { SigninValidator, SignupValidator } from '@src/core/validator'
import User from '@src/models/user'
import { generateJwt } from '@src/utils/util'
import { ParameterException } from '@src/core/http-exception'

const router = new Router({
  prefix: '/v1/user'
})

router.post('/signup', async (ctx, next) => {
  const v = await new SignupValidator(ctx).validate()

  // 先检查是否有同名账户
  if (await isUserExisted(v.get('body.username'))) {
    throw new ParameterException('该账户已存在')
  }

  const newUser = {
    username: v.get('body.username'),
    password: v.get('body.password')
  }
  const user = await User.create(newUser)
  ctx.result = {
    id: user.get('id')
  }
  ctx.message = '新建用户成功'

  await next()
})

router.post('/signin', async (ctx, next) => {
  const v = await new SigninValidator(ctx).validate()
  const user = await User.verify(v.get('body.username'), v.get('body.password'))
  if (user) {
    const token = generateJwt(user.get('id') as number)
    ctx.result = {
      token
    }
  }

  await next()
})

async function isUserExisted(username: string) {
  return !!(await User.findOne({
    where: {
      username
    }
  }))
}

export default router
