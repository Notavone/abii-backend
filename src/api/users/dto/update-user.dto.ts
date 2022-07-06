import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import { IsArray, IsBoolean, IsEmpty, IsNumber, IsOptional } from "class-validator";
import { Authority } from "../../auth/policies/authority";
import { Client } from "../../clients/entities/client.entity";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({
    description: "The authorities of the user",
    type: Array,
    example: [Authority.ADMIN],
    nullable: true,
  })
  readonly authorities?: Authority[];

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: "If the user is able to connect or not",
    type: Boolean,
    example: true,
  })
  readonly activated?: boolean;

  @IsOptional()
  @ApiPropertyOptional({
    description: "The user's new client",
    type: Client,
  })
  readonly client: Client;
}
