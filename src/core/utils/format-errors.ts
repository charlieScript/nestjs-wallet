import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

function formatErrorsHelper(errors: ValidationError[]): string[] {
  return errors.reduce((acc, err): string[] => {
    const { property, constraints, children } = err;
    if (constraints) {
      acc = acc.concat(Object.values(constraints));
    }
    if (Array.isArray(children) && children.length > 0) {
      acc = acc.concat(formatErrorsHelper(children));
    }
    return acc;
  }, []);
}

export const validationPipeExceptionFactory = (errors: ValidationError[]) => {
  return new BadRequestException(formatErrorsHelper(errors));
};
