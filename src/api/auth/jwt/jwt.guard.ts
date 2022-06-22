import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class JwtGuard extends AuthGuard("jwt") {

  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    return super.canActivate(context);
  }
}
