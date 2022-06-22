import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateEanDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: "",
  })
  value: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    description: "",
    example: 1,
  })
  productId: number;

  @IsPositive()
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    description: "",
    example: 1,
  })
  quantity?: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: "",
    example: ""
  })
  comment?: string;
}
