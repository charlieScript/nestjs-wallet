import { configuration } from 'src/core';
import * as entities from './entities';
const entityList = [
  ...Object.values(entities),
];

const ormDalConfig: any = configuration().database;

export const getOrmConfig = (config) => {
  const dalConfig: any = config().database;
  dalConfig.entities = entityList;
  return dalConfig;
};
