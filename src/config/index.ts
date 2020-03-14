import * as pt from 'path'

export const logConfig: {
  accessPath: string
  errorPath: string
} = {
  accessPath: pt.resolve(__dirname, '../../logs/access.log'),
  errorPath: pt.resolve(__dirname, '../../logs/errors.log')
}
