import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { LocalGuard } from "./local/local.guard";
import { LoginDto } from "./dto/login.dto";
import { LoginResponseDto } from "./dto/login-response.dto";
import { JwtGuard } from "./jwt/jwt.guard";
import { LoggedUser } from "./policies/user.decorator";
import { User } from "../users/entities/user.entity";
import { NotificationsService } from "../notifications/notifications.service";

@ApiTags("auth")
@Controller("api/auth")
export class AuthController {

  constructor(
    private readonly authService: AuthService,
    private notificationsService: NotificationsService,
  ) {
  }

  @Post("login")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(LocalGuard)
  @HttpCode(HttpStatus.OK)
  login(@Req() req, @Res({ passthrough: true }) res, @Body() body: LoginDto): LoginResponseDto {
    let login = this.authService.login(req.user);
    const secure = process.env.NODE_ENV === "production";
    const maxAge = login.expires_in * 1000;
    res.cookie("access_token", login.access_token, { maxAge, httpOnly: true, secure, sameSite: "lax" });
    // Indicateur lisible par le front (le token, lui, n'est plus accessible au JS)
    res.cookie("logged_in", "1", { maxAge, httpOnly: false, secure, sameSite: "lax" });
    return login;
  }

  @Post("logout")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Res({ passthrough: true }) res, @LoggedUser() user: User): Promise<void> {
    await this.notificationsService.unsubscribe(user);
    res.clearCookie("access_token");
    res.clearCookie("logged_in");
  }
}
