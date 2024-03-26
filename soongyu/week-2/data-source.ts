import { DataSource } from 'typeorm'

// export default : 한 모듈 안에서 객체 1개만 내보낼 때 사용
// export : 한 모듈 안에서 객체 여러개 내보낼 때 사용
export default new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '1234',
  database: 'hanghaeplus',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
})
