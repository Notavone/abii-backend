import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @IsEmail()
  @MaxLength(255)
  @ApiProperty({
    description: "The email of the user",
    maxLength: 255,
    example: "sample@email.com",
  })
  readonly email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @ApiProperty({
    description: "The password of the user",
    maxLength: 255,
    minLength: 8,
    example: "mypassword",
  })
  readonly password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @ApiProperty({
    description: "The username of the user",
    maxLength: 20,
    minLength: 2,
    example: "john",
  })
  readonly username: string;

  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty({
    description: "The first name of the user",
    maxLength: 40,
    minLength: 2,
    example: "John",
  })
  readonly firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty({
    description: "The last name of the user",
    maxLength: 40,
    minLength: 2,
    example: "Doe",
  })
  readonly lastName: string;
}
