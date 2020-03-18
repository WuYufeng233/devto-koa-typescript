import Koa from 'koa'

export interface KoaMiddlewareGenerator<T = any> {
  (...args: T[]): Koa.Middleware
}

export interface IException extends Error {
  /** http状态码 */
  status: number
  /** 错误码 */
  code: number
}

export type IExceptionTip = Pick<IException, 'message' | 'status' | 'code'>

export interface IUserInfo {
  username: string
  password: string
  password2?: string
}
