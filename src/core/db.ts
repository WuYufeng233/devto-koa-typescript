import { Sequelize, Model } from 'sequelize'
import { database } from '@src/config'

const sequelize = new Sequelize(
  database.databaseName,
  database.user,
  database.password,
  {
    dialect: 'mysql',
    host: database.host,
    port: database.port,
    timezone: '+08:00',
    define: {
      // 不删除数据库条目,但将新添加的属性deletedAt设置为当前日期(删除完成时)
      paranoid: true,
      // 将自动设置所有属性的字段参数为下划线命名方式
      underscored: true,
      scopes: {
        bh: {
          attributes: {
            exclude: ['updatedAt', 'deletedAt', 'createdAt']
          }
        }
      }
    }
  }
)

sequelize.sync({
  // 自动删除原来表，重新创建新的表
  // force: true
})

export default sequelize
