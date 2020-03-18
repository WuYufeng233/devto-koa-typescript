require('module-alias/register')
// eslint-disable-next-line
import Koa from 'koa'
import BodyParser from 'koa-bodyparser'
import helmet from 'koa-helmet'
import cors from 'koa2-cors'

import { server } from '@src/config'

import { logger, exception, corsHandlers } from '@src/middlewares'
import InitManager from '@src/core/init'

const app = new Koa()

app.use(logger.loggerMiddlewareGenerator())
app.use(exception.exceptionMiddlewareGenerator())
app.use(BodyParser())
app.use(helmet())
app.use(cors(corsHandlers))

InitManager.initCore(app)

app.listen(server.port, () => {
  console.log(`server running on port ${server.port}`)
})
