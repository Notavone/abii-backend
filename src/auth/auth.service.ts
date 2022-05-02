import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { Repository } from "typeorm";
import { compare } from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { LoginResponseDto } from "./dto/login-response.dto";
import { MailService } from "../mail/mail.service";

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {
  }

  async validateJwt(payload: any) {
    const user = await this.userRepository.findOne({
      where: {
        email: payload.email,
        uuid: payload.uuid,
      },
    });
    if (!user) return null;
    return user;
  }

  async validateUser(email: string, pass: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return null;

    const isPasswordValid = await compare(pass, user.password);
    if (!isPasswordValid) return null;

    return user;
  }

  login(user: User): LoginResponseDto {
    return {
      expires_in: this.configService.get<number>("JWT_COOKIE_MAX_AGE"),
      access_token: this.jwtService.sign({
        uuid: user.uuid,
        email: user.email,
      }),
    };
  }
}
