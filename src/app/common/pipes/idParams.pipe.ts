import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { validate as isUuid } from 'uuid';

@Injectable()
export class UUIDValidationPipe implements PipeTransform {
  transform(value: any) {
    console.log('🚀 Incoming value for UUID pipe:', value, typeof value);

    if (typeof value !== 'string') {
      throw new BadRequestException('The value passed as UUID is not a string');
    }

    if (!isUuid(value)) {
      throw new BadRequestException(`Invalid UUID format: ${value}`);
    }

    return value;
  }
}
