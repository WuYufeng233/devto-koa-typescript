import { KoaMiddlewareGenerator } from '@src/types'
import { environment } from '@src/config'
import { HttpException } from '@src/core/http-exception'
import * as constants from '@src/utils/constants'

const exceptionMiddlewareGenerator: KoaMiddlewareGenerator<any> = () => {
  return async (ctx, next) => {
    try {
      await next()
    } catch (e) {
      const isDev = environment === 'dev'
      const isHttpException = e instanceof HttpException
      if (isDev && !isHttpException) {
        // 开发时代码抛出的异常抛出控制台
        throw e
      }
      /**
       * 异常分为：已知错误异常，未知错误异常
       */
      if (isHttpException) {
        ctx.body = {
          message: e.msg,
          code: e.code
        }
        ctx.status = e.status
      } else {
        // 服务器未知异常以500返回
        ctx.body = {
          message: constants.ServerExceptionTip.message,
          code: constants.ServerExceptionTip.code,
          request: `${ctx.method} ${ctx.path}`
        }
        ctx.status = constants.ServerExceptionTip.status
      }
    }
  }
}

export { exceptionMiddlewareGenerator }
