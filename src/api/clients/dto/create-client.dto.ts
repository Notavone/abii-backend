import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateClientDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  readonly name: string;
}
