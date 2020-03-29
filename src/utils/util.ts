import jwt from 'jsonwebtoken'

import { jwt as jwtConfig } from '@src/config'

// type TReflectKey = string | number | symbol

export function findMemberKeys<
  T extends object & { [k: string]: any },
  U extends Function
>(
  instance: T,
  {
    filter,
    prefix,
    specifiedType
  }: Partial<{
    filter: (...args: any[]) => boolean
    prefix: string
    specifiedType: U
  }>
) {
  // 递归
  function _find<
    Instance extends { __proto__?: any }
    // 这里本来想 Key extends keyof Instance的，但是报错 string[] is not assigned to Key[]
  >(inst: Instance): string[] {
    // 基线条件
    if (!inst.__proto__) {
      return []
    }

    let names = Object.keys(inst)
    names = names.filter(name => {
      // 过滤不满足条件的属性或方法名
      return _shouldKeep(name)
    })

    return [...names, ..._find(inst.__proto__)]
  }

  function _shouldKeep(name: string | number | symbol): boolean {
    if (filter) {
      if (filter(name)) {
        return true
      }
    }
    if (prefix) {
      if ((<string>name).startsWith(prefix)) {
        return true
      }
    }
    if (specifiedType) {
      if (instance[<string>name] instanceof specifiedType) {
        return true
      }
    }
    return false
  }

  return _find(instance)
}

// TODO: 增加权限控制
export function generateJwt(uid: number) {
  const secretKey = jwtConfig.secretKey
  const expiresIn = jwtConfig.expiresIn

  // 生成 token
  const token = jwt.sign(
    {
      uid
    },
    secretKey,
    {
      expiresIn
    }
  )

  return token
}
