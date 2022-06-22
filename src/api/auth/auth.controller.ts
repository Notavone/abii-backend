import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LocalGuard } from "./local/local.guard";
import { LoginDto } from "./dto/login.dto";
import { LoginResponseDto } from "./dto/login-response.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) {
  }

  @Post("login")
  @UseGuards(LocalGuard)
  @HttpCode(HttpStatus.OK)
  login(@Req() req, @Res({ passthrough: true }) res, @Body() body: LoginDto): LoginResponseDto {
    let login = this.authService.login(req.user);
    res.cookie("access_token", login.access_token, {
      maxAge: login.expires_in * 1000,
    });
    return login;
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res): void {
    res.clearCookie("access_token");
  }
}
