import * as pt from 'path'

export const server = {
  port: 3001
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

export const database = {
  databaseName: 'middle_tier',
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456'
}

export const jwt = {
  secretKey: 'abc123',
  expiresIn: 60 * 60
}

export const defaultUserInfo = {
  avatar:
    'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
}
