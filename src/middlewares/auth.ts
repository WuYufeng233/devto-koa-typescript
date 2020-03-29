import jwt from 'jsonwebtoken'
import BasicAuth from 'basic-auth'
import Koa from 'koa'

import { KoaMiddlewareGenerator } from '@src/types'
import { AuthFailedException } from '@src/core/http-exception'
import { jwt as jwtConfig } from '@src/config'

class Auth {
  level: number

  static USER: number = 8
  static ADMIN: number = 16
  static SUPER_ADMIN: number = 32

  constructor(level: number = 1) {
    this.level = level
  }

  get m(): Koa.Middleware {
    return async (ctx, next) => {
      const userToken = BasicAuth(ctx.req)
      let errMsg = 'token不合法'
      // userToken上有 name，pass两个属性，前端只传入name
      if (!userToken || !userToken.name) {
        throw new AuthFailedException(errMsg)
      }

      try {
        let decode = jwt.verify(userToken.name, jwtConfig.secretKey) as any
        ctx.auth = {
          uid: decode.uid
          // scope: decode.scope
        }
        ctx.body = ctx.auth
      } catch (e) {
        if (e.name === 'TokenExpiredError') {
          errMsg = 'token已过期'
        }
        throw new AuthFailedException(errMsg)
      }

      await next()
    }
  }
}

export default Auth
