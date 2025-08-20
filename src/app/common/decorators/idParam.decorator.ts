import { Param } from '@nestjs/common';
import { UUIDValidationPipe } from '../pipes/idParams.pipe';

export const IdParam = (paramName = 'id') =>
  Param(paramName, new UUIDValidationPipe());
