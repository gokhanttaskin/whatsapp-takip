import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetNumara = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.numara; // `numara` alanının kullanıcı nesnesinde tanımlı olduğundan emin ol
  },
);
