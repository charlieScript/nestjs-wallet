import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class PageDto<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty()
  readonly total: number;

  constructor(data: T[], total: number) {
    this.total = total;
    this.data = data;
  }
}

export class PageV3Dto<T> extends PageDto<T> {
  readonly extraInfo?: unknown;
}
