import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

Injectable();
export class ValidatePayloadExistsPipe implements PipeTransform {
  transform(payload: any): any {
    if (!Object.keys(payload).length) {
      throw new BadRequestException('Request data cannot not be empty');
    }

    return payload;
  }
}
