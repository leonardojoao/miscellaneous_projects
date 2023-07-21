// import { createConnection } from 'typeorm';

// createConnection

import 'reflect-metadata';
import { DataSource } from 'typeorm';
// import { Photo } from './entity/Photo';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'docker',
  password: 'ignite',
  database: 'rentalx',
  // entities: [Photo],
  synchronize: true,
  logging: false,
  // cli: {
  //   migrationsDir: "./src/databese/migrations"
  // }
  entities: ['./src/modules/**/entities/*.ts'],
  migrationsRun: false,
  migrations: ['./src/database/migrations/*.ts'],
  migrationsTableName: 'history',
});

// to initialize initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
AppDataSource.initialize()
  .then(() => {
    // here you can start to work with your database
    console.log("Data Source has been initialized!")
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err)
  });

export { AppDataSource };
