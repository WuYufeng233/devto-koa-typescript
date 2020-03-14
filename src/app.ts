require('module-alias/register')
// eslint-disable-next-line
import Koa from 'koa'
import BodyParser from 'koa-bodyparser'

import { logger } from '@src/middlewares'

const app = new Koa()
const bodyparser = BodyParser()

app.use(logger.loggerMiddlewareGenerator())
app.use((ctx, use) => {
  ctx.body = 'hello'
})

app.listen(3000, () => {
  console.log('server running on port 3000')
})
