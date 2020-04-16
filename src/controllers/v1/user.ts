import Router from 'koa-router'
import Koa from 'koa'

import { IUserInfo } from '@src/types'
import { SigninValidator, SignupValidator } from '@src/core/validator'
import User from '@src/models/user'
import { generateJwt } from '@src/utils/util'
import {
  ParameterException,
  AuthFailedException
} from '@src/core/http-exception'
import { jwt as jwtConfig, defaultUserInfo } from '@src/config'
import { Auth } from '@src/middlewares'

const router = new Router({
  prefix: '/v1/user'
})

/**
 * 注册
 */
router.post('/signup', async (ctx, next) => {
  const v = await new SignupValidator(ctx).validate()

  // 先检查是否有同名账户
  if (await isUserExisted(v.get('body.username'))) {
    throw new ParameterException('该账户已存在')
  }

  const newUser = {
    username: v.get('body.username'),
    password: v.get('body.password'),
    scope: Auth.USER,
    avatar: defaultUserInfo.avatar
  }
  const user = await User.create(newUser)
  ctx.result = {
    uid: user.get('id')
  }
  ctx.message = '新建用户成功'

  await next()
})

/**
 * 登录
 */
router.post('/signin', async (ctx, next) => {
  const v = await new SigninValidator(ctx).validate()
  const user = await User.verify(v.get('body.username'), v.get('body.password'))
  if (user) {
    const token = generateJwt(
      user.get('id') as number,
      user.get('scope') as number
    )
    ctx.result = {
      token,
      uid: user.get('id'),
      currentAuthority: convertScope2Authority(user.get('scope') as number)
    }
    // 写入cookie
    ctx.cookies.set('access_token', token, {
      // domain: 'localhost',
      // 这里默认 path: / , 否则前端在转发请求收到回包后，因为path不匹配丢失cookie
      // path: ctx.path,
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'strict'
    })
  }

  await next()
})

/**
 * 用户信息
 */
router.get('/info', new Auth(Auth.USER).m, async (ctx, next) => {
  const user = await getUser(ctx)
  ctx.result = {
    username: user.get('username'),
    uid: user.get('id'),
    avatar: user.get('avatar'),
    currentAuthority: convertScope2Authority(user.get('scope'))
  }
  await next()
})

// 工具方法

async function isUserExisted(username: string) {
  return !!(await User.findOne({
    where: {
      username
    }
  }))
}

function convertScope2Authority(scope: number) {
  let authority: string
  if (scope < Auth.USER) {
    authority = 'guest'
  } else if (scope >= Auth.USER && scope < Auth.ADMIN) {
    authority = 'user'
  } else {
    authority = 'admin'
  }
  return authority
}

async function getUser(ctx: Koa.Context) {
  if (ctx.state.currentUser) {
    return ctx.state.currentUser
  } else {
    const { uid } = ctx.state.auth
    try {
      const currentUser = await User.findOne({
        where: {
          id: uid
        }
      })
      ctx.state.currentUser = currentUser
      return currentUser
    } catch (e) {
      throw new AuthFailedException('账号不存在')
    }
  }
}

export default router
