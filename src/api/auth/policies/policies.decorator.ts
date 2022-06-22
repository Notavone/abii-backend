import { AppAbility } from "./casl-ability.factory";
import { SetMetadata } from "@nestjs/common";

interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;

export const Permissions = (...handlers: PolicyHandler[]) => SetMetadata("policies", handlers);
