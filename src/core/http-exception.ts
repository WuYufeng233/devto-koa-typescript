import { IException } from '@src/types'
import * as constants from '@src/utils/constants'

type TMessage = string | string[]

export class HttpException extends Error implements IException {
  /** 错误码 */
  code: number
  /** http状态码 */
  status: number
  /** 错误信息 */
  msg: TMessage // 不能命名为message，和Error的message重名

  constructor(
    msg: TMessage = constants.HttpExceptionTip.message,
    status: number = constants.HttpExceptionTip.status,
    code: number = constants.HttpExceptionTip.code
  ) {
    super()
    // Extending built-ins like Error, Array, and Map may no longer work
    // 所以需要手动设置原型
    Object.setPrototypeOf(this, HttpException.prototype)

    this.msg = msg
    this.code = code
    this.status = status
  }
}

export class ParameterException extends HttpException implements IException {
  constructor(
    msg: TMessage = constants.ParameterExceptionTip.message,
    status: number = constants.ParameterExceptionTip.status,
    code: number = constants.ParameterExceptionTip.code
  ) {
    super(msg, status, code)
    Object.setPrototypeOf(this, ParameterException.prototype)
  }
}
