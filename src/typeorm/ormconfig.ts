import { configuration } from 'src/core';
import * as entities from './entities/';
import { ConnectionOptions } from 'typeorm';

const entityList = [
  ...Object.values(entities),
];
const ormDalConfig: any = configuration().database;
ormDalConfig.entities = entityList;
const config: ConnectionOptions = { ...ormDalConfig };


export = config;
