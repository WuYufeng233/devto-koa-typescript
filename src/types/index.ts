/// <reference path="./global.d.ts" />
// 一定要上面这行指令，否则ts-node无法识别global.d.ts里的内容，因为ts-node默认不加载tsconfig.json的配置
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
