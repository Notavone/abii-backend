import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { Reflector } from "@nestjs/core";
import { PolicyHandler } from "./policies.decorator";
import { AppAbility, CaslAbilityFactory } from "./casl-ability.factory";
import { PUBLIC_KEY } from "../jwt/public.decorator";

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const policyHandlers = this.reflector.get<PolicyHandler[]>("policies", context.getHandler()) || [];
    const isPublic = this.reflector.getAllAndOverride(PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const { user } = context.switchToHttp().getRequest();
    const ability = this.caslAbilityFactory.createForUser(user);

    return policyHandlers.every((handler) =>
      PoliciesGuard.execPolicyHandler(handler, ability),
    );
  }

  private static execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === "function") {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
