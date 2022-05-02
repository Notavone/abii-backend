import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateClientDto } from "./create-client.dto";
import { IsDateString, IsNumber, IsOptional } from "class-validator";

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    description: "Client's new balance",
    example: 1,
  })
  readonly balance?: number;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    description: "Client's new end of subscription date",
    example: "2020-01-01T00:00:00.000Z",
  })
  readonly subscribedUntil?: Date;
}
