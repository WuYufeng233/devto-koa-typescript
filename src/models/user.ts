import { Sequelize, Model, INTEGER, STRING } from 'sequelize'

import sequelize from '@src/core/db'
import { AuthFailedException } from '@src/core/http-exception'

class User extends Model {
  static async verify(username: string, password: string) {
    const user = await User.findOne<User>({
      where: {
        username
      }
    })
    if (!user) {
      throw new AuthFailedException('账号不存在')
    }
    const isCorrectPassword = password === user.get('password')
    if (!isCorrectPassword) {
      throw new AuthFailedException('密码错误')
    }

    return user
  }
}

User.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: STRING,
    password: STRING
  },
  {
    sequelize,
    tableName: 'user'
  }
)

export default User
