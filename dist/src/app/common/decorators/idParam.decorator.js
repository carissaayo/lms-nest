"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdParam = void 0;
const common_1 = require("@nestjs/common");
const idParams_pipe_1 = require("../pipes/idParams.pipe");
const IdParam = (paramName = 'id') => (0, common_1.Param)(paramName, new idParams_pipe_1.UUIDValidationPipe());
exports.IdParam = IdParam;
//# sourceMappingURL=idParam.decorator.js.map