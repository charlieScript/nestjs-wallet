import { DataSource } from 'typeorm';
import * as entities from './entities/';
import { configuration } from '../core/config/configuration';

const entityList = [...Object.values(entities)];
const ormDalConfig: any = configuration().database;
ormDalConfig.entities = entityList;

export default new DataSource({
  ...ormDalConfig,
  migrations: ['src/typeorm/migrations/*.ts'],
});
