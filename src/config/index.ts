import * as pt from 'path'

export const server = {
  port: 3000
}

export const logConfig: {
  accessPath: string
  errorPath: string
} = {
  accessPath: pt.resolve(__dirname, '../../logs/access.log'),
  errorPath: pt.resolve(__dirname, '../../logs/errors.log')
}

// 'dev' | 'prod'
export const environment = 'dev'
