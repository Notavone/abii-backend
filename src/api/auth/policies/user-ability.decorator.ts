import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { CaslAbilityFactory } from "./casl-ability.factory";

export const UserAbility = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const caslAbilityFactory = new CaslAbilityFactory();
  const { user } = ctx.switchToHttp().getRequest();
  return caslAbilityFactory.createForUser(user);
});
