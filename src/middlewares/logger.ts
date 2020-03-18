import * as fs from 'fs'
import * as pt from 'path'
import log4js from 'log4js'
import Koa from 'koa'

import { KoaMiddlewareGenerator } from '@src/types'
import { logConfig } from '@src/config'

// 检查日志路径是否存在，不存在则创建
const logConfigKeys = Object.keys(logConfig)
for (let i = 0; i < logConfigKeys.length; i++) {
  const logsDir = pt.parse((<any>logConfig)[logConfigKeys[i]]).dir
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir)
  }
}

log4js.configure({
  appenders: {
    console: {
      type: 'console'
    },
    access: {
      type: 'dateFile',
      filename: logConfig.accessPath,
      pattern: 'yyyy-MM-dd'
    },
    error: {
      type: 'dateFile',
      filename: logConfig.errorPath,
      pattern: 'yyyy-MM-dd'
    }
  },
  categories: {
    default: {
      appenders: ['console', 'access', 'error'],
      level: log4js.levels.INFO.levelStr
    },
    access: {
      appenders: ['access'],
      level: log4js.levels.INFO.levelStr
    },
    error: {
      appenders: ['error'],
      level: log4js.levels.ERROR.levelStr
    }
  }
})

const accessLogger = log4js.getLogger('access')
const errorLogger = log4js.getLogger('error')

const loggerMiddlewareGenerator: KoaMiddlewareGenerator<any> = () => {
  return async (ctx, next) => {
    const start = Date.now()
    await next()
    const ms = Date.now() - start

    const remoteAddress =
      ctx.headers['x-forwarded-for'] ||
      ctx.ip ||
      ctx.ips ||
      (ctx.socket && ctx.socket.remoteAddress)
    let logText = `${ctx.method} ${ctx.status} ${
      ctx.url
    } 请求参数： ${JSON.stringify(
      ctx.request.body
    )} 响应参数： ${JSON.stringify(ctx.body)} - ${remoteAddress} - ${ms}ms`
    accessLogger.info(logText)
  }
}

export { accessLogger, errorLogger, loggerMiddlewareGenerator }
