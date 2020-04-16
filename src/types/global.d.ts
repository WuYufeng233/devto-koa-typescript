// global.d.ts不需要再次export
import Koa from 'koa'

// 拓展 koa 属性/方法声明
declare module 'koa' {
  interface ExtendableContext {
    result?: any
    // koa官方推荐的命名空间，使用方式一般是在多个中间件之间共享数据
    state?: {
      auth?: any
      currentUser?: any
    }
  }
}
