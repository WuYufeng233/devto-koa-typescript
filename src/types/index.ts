import Koa from 'koa'

export interface KoaMiddlewareGenerator<T = any> {
  (...args: T[]): Koa.Middleware
}
