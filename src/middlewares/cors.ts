import cors from 'koa2-cors'

const corsHandlers: cors.Options = {
  origin: ctx => {
    // 这里可以设置不允许跨域的接口地址
    if (ctx.url === '/test') {
      return false
    }
    return '*'
  },
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept']
}

export default corsHandlers
