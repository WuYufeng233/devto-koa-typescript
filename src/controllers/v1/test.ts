import Router from 'koa-router'

import { Auth } from '@src/middlewares'

const router = new Router({
  prefix: '/v1/test'
})

router.get('/', new Auth().m)

export default router
