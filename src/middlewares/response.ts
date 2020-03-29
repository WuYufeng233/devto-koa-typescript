import { KoaMiddlewareGenerator } from '@src/types'

const responseMiddlewareGenerator: KoaMiddlewareGenerator = () => {
  return async (ctx, next) => {
    try {
      await next()

      // 统一处理正常情况下的回包
      if (ctx.result !== undefined) {
        ctx.type = 'json'
        ctx.status = 200
        ctx.body = {
          code: 0,
          message: ctx.message || '',
          data: ctx.result
        }
      }
    } catch (e) {
      // 重新抛出，由exception中间件处理
      throw e
    }
  }
}

export default responseMiddlewareGenerator
