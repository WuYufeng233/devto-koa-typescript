import { IExceptionTip } from '@src/types'

export const ServerExceptionTip: IExceptionTip = {
  code: 10000,
  status: 500,
  message: '服务器出了点不可描述的问题...'
}

export const HttpExceptionTip: IExceptionTip = {
  code: 10001,
  status: 200,
  message: '服务器出了点问题...'
}

export const ParameterExceptionTip: IExceptionTip = {
  code: 10002,
  status: 200,
  message: '参数错误，请检查参数'
}

export const AuthFailedExceptionTip: IExceptionTip = {
  code: 20001,
  status: 401,
  message: '授权失败'
}
