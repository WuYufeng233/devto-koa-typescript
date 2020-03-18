import Router from 'koa-router'

import { IUserInfo } from '@src/types'
import { SigninValidator } from '@src/core/validator'

const router = new Router({
  prefix: '/v1/user'
})

router.post('/signup', async (ctx, next) => {})

router.post('/signin', async (ctx, next) => {
  const v = await new SigninValidator(ctx).validate()
  ctx.body = {
    username: v.get('body.username'),
    password: v.get('body.password')
  } as IUserInfo
  await next()
})

export default router
