import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ConfirmUserDto {
  @IsString()
  @ApiProperty({
    description: "The confirmation token",
    example: "123456789",
  })
  readonly activationKey: string;
}
