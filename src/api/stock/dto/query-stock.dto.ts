import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNumberString, IsOptional } from "class-validator";

export class QueryStockDto {
  @IsNumberString()
  @IsOptional()
  @ApiPropertyOptional({})
  productId?: number;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({})
  fromDate?: Date;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({})
  toDate?: Date;

  @IsNumberString()
  @IsOptional()
  @ApiPropertyOptional({})
  userId?: number;
}
