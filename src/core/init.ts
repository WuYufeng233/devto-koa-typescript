import Koa from 'koa'
import Router from 'koa-router'

import * as controllers from '@src/controllers/v1'

class InitManager {
  static app: Koa

  static initCore(app: Koa) {
    InitManager.app = app
    InitManager.initLoadRouters()
  }

  static initLoadRouters() {
    for (let route in controllers) {
      if ((<any>controllers)[route] instanceof Router) {
        InitManager.app.use((<any>controllers)[route].routes())
      }
    }
  }
}

export default InitManager
