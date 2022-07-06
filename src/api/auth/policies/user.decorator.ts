import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { CaslAbilityFactory } from "./casl-ability.factory";

export const LoggedUser = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const { user } = ctx.switchToHttp().getRequest();
  return user;
});
