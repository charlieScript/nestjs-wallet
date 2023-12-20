import { TypeOrmModule } from '@nestjs/typeorm';
import { getOrmConfig } from './getOrmConfig';

export const getOrm = (configuration) => {
  return TypeOrmModule.forRoot(getOrmConfig(configuration));
};




