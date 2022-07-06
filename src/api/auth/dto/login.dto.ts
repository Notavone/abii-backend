import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @IsString()
  @ApiProperty({
    description: "User's email",
    example: "sample@email.com"
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: "User's password",
    example: "mypassword"
  })
  password: string;
}
