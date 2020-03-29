import Koa from 'koa'
import * as _ from 'lodash'

import { ParameterException } from '@src/core/http-exception'
import { findMemberKeys } from '@src/utils/util'

/**
 * 使用commonjs引入，因为@types/validator里导出的validator是namespace，不能索引
 */
const validator = require('validator')

interface PathValuePair {
  value: any
  path: string[]
}
interface CheckResult {
  success: boolean
  msg: string
}
/**
 * 为了使 class Validator有index signature，需要声明一个同名的interface
 */
interface Validator {
  [k: string]: any
}
export interface ValidatorParams {
  body: Koa.Request['body']
  query: Koa.Request['query']
  path: Koa.Request['path']
  header: Koa.Request['header']

  [k: string]: any
}
class Validator {
  ctx: Koa.Context
  data: Partial<ValidatorParams>
  parsed: Partial<ValidatorParams>
  alias: {
    [k: string]: string
  }

  constructor(ctx: Koa.Context) {
    this.ctx = ctx
    this.data = {}
    this.parsed = {}
    this.alias = {}
  }

  get allParams(): ValidatorParams {
    return {
      body: this.ctx.request.body,
      query: this.ctx.request.query,
      path: this.ctx.request.path,
      header: this.ctx.request.header
    }
  }

  get(path: string, parsed: boolean = true) {
    if (parsed) {
      const value = _.get(this.parsed, path, null)
      if (!value) {
        const keys = path.split('.')
        const key = _.last(keys)
        return _.get(this.parsed.default, key!)
      }
      return value
    } else {
      return _.get(this.data, path)
    }
  }

  _generateFindMemberKeysFilter(key: string): boolean {
    if (/validate([A-Z])\w+/g.test(key)) {
      return true
    }
    if (this[key] instanceof Array) {
      this[key].forEach((value: any) => {
        const isRuleType = value instanceof Rule
        if (!isRuleType) {
          throw new Error('验证规则数组必须全部为Rule类型')
        }
      })
      return true
    }
    return false
  }

  _findFieldValue(key: string): PathValuePair {
    for (let i in this.data) {
      const value = _.get(this.data, [i, key])
      if (value) {
        return {
          value,
          path: [i, key]
        }
      }
    }
    return {
      value: null,
      path: []
    }
  }

  async _check(
    key: string,
    alias: { [k: string]: string } = {}
  ): Promise<CheckResult> {
    // 用户自定义验证函数'validateXxxx'
    const isCustomFn = typeof this[key] === 'function'
    let rst
    if (isCustomFn) {
      // 自定义函数校验
      try {
        // await 调用，保证异步的自定义字段验证也能被执行
        await this[key](this.data)
        rst = new RuleResult(true)
      } catch (e) {
        rst = new RuleResult(false, e.msg || e.message || '参数错误')
      }
    } else {
      // 通过定义Rule校验
      const rules = this[key] as Rule[]
      const ruleField = new RuleField(rules)
      // 字段名/属性名别名替换
      key = alias[key] ? alias[key] : key
      const field = this._findFieldValue(key)

      rst = ruleField.validate(field.value)
      if (rst.pass) {
        // 如果参数路径不存在，往往是因为用户传了空值，而又设置了默认值
        if (field.path.length === 0) {
          _.set(this.parsed, ['default', key], rst.legalValue)
        } else {
          _.set(this.parsed, field.path, rst.legalValue)
        }
      }
    }
    if (!rst.pass) {
      const msg = `${isCustomFn ? '' : key} - ${rst.msg}`
      return {
        msg,
        success: false
      }
    }
    return {
      msg: 'ok',
      success: true
    }
  }

  async validate(alias: { [k: string]: string } = {}): Promise<Validator> {
    this.alias = alias
    let params = this.allParams
    this.data = _.cloneDeep(params)
    this.parsed = _.cloneDeep(params)

    const memberKeys = findMemberKeys(this, {
      filter: this._generateFindMemberKeysFilter.bind(this)
    })

    const errorMsgs = []
    for (let key of memberKeys) {
      const rst = await this._check(key, alias)
      if (!rst.success) {
        errorMsgs.push(rst.msg)
      }
    }
    if (errorMsgs.length) {
      throw new ParameterException(errorMsgs)
    }
    this.ctx.v = this
    return this
  }
}

/**
 * 规则校验结果
 */
class RuleResult {
  /** 规则校验结果，验证通过/不通过 */
  pass: boolean
  /** 校验结果附带信息 */
  msg: string

  constructor(pass: boolean, msg: string = '') {
    this.pass = pass
    this.msg = msg
  }
}

/**
 * validator里每个字段的校验结果
 */
class RuleFieldResult extends RuleResult {
  legalValue: any

  constructor(pass: boolean, msg: string = '', legalValue: any = null) {
    super(pass, msg)
    this.legalValue = legalValue
  }
}

/**
 * 自定义规则
 */
class Rule {
  name: string
  msg: string
  params: any[]

  constructor(name: string, msg: string, ...params: any[]) {
    this.name = name
    this.msg = msg
    this.params = params
  }

  validate(field: any): RuleResult {
    if (this.name === 'isOptional') {
      return new RuleResult(true)
    }
    if (!validator[this.name](field, ...this.params)) {
      return new RuleResult(false, this.msg || '参数错误')
    }
    return new RuleResult(true)
  }
}

/**
 * 对validator里的每一个字段，设置一个RuleField对象管理该字段的验证，
 * RuleField负责保存该字段里被设置的规则和执行验证
 */
class RuleField {
  rules: Rule[]

  constructor(rules: Rule[]) {
    this.rules = rules
  }

  validate(field: any): RuleFieldResult {
    // 字段为空
    if (field === null) {
      // 如果允许为空
      if (this.allowEmpty) {
        return new RuleFieldResult(true, '', this.hasDefault)
      } else {
        return new RuleFieldResult(false, '字段为必填参数')
      }
    }

    // 字段不为空
    const filedResult = new RuleFieldResult(false)
    for (let rule of this.rules) {
      let rst = rule.validate(field)
      if (!rst.pass) {
        filedResult.msg = rst.msg
        filedResult.legalValue = null
        // 一旦一条规则校验不通过，则立即停止这个字段的继续验证
        return filedResult
      }
    }

    return new RuleFieldResult(true, '', this._convert(field))
  }

  get allowEmpty(): boolean {
    for (let rule of this.rules) {
      if (rule.name === 'isOptional') {
        return true
      }
    }
    return false
  }

  get hasDefault(): any {
    for (let rule of this.rules) {
      const defaultValue = rule.params[0]
      if (defaultValue && rule.name === 'isOptional') {
        return defaultValue
      }
    }
  }

  _convert(value: string | number | boolean): number | boolean | string {
    for (let rule of this.rules) {
      if (rule.name === 'isInt') {
        return parseInt(value + '')
      }
      if (rule.name === 'isFloat') {
        return parseFloat(value + '')
      }
      if (rule.name === 'isBoolean') {
        return !!value
      }
    }
    return value
  }
}

export { Rule, Validator }
