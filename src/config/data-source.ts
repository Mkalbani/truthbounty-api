import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const dataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  // In development, allow automatic schema sync so missing tables are created.
  // Disable in production by setting NODE_ENV=production.
  synchronize: process.env.NODE_ENV !== 'production',
});

export default dataSource;