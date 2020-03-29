// global.d.ts不需要再次export
import Koa from 'koa'

// 拓展 koa 属性/方法声明
declare module 'koa' {
  interface ExtendableContext {
    result?: any
  }
}
