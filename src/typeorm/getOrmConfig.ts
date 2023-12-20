import * as entities from './entities';
const entityList = [
  ...Object.values(entities),
];

export const getOrmConfig = (config) => {
  const dalConfig: any = config().database;
  dalConfig.entities = entityList;
  return dalConfig;
};
