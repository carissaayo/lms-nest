import { PipeTransform, BadRequestException } from '@nestjs/common';

export class ParseJsonArrayPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          throw new BadRequestException('Value must be an array');
        }
        return parsed;
      } catch (e) {
        throw new BadRequestException('Invalid JSON array');
      }
    }
    return value;
  }
}
