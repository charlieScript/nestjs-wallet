import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  ParseArrayOptions,
  ParseArrayPipe,
} from '@nestjs/common';

export interface ParseArrayWithMinLengthOptions extends ParseArrayOptions {
  min?: number;
}

Injectable();
export class ParseArrayWithMinLengthPipe extends ParseArrayPipe {
  private min: number;
  constructor(options?: ParseArrayWithMinLengthOptions) {
    super(options);
    this.min = options.min;
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    const data = await super.transform(value, metadata);
    if (data?.length < this.min) {
      throw new BadRequestException(
        `Must have at least ${this.min} item${this.min === 1 ? '' : 's'}`,
      );
    }
    return data;
  }
}
