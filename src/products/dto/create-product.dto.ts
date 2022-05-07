import { ProductType } from "../product-type";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateProductDto {
  @MinLength(3)
  @MaxLength(30)
  @IsString()
  @ApiProperty({
    description: "Product name",
    example: "Product 1",
  })
  readonly name: string;

  @Min(0)
  @IsNumber()
  @ApiProperty({
    description: "Product price",
    example: 100,
  })
  readonly price: number;

  @Min(0)
  @IsNumber()
  @ApiProperty({
    description: "Product discounted price",
    example: 100,
  })
  readonly price_red: number;

  @IsEnum(ProductType)
  @ApiProperty({
    description: "Product type",
    example: ProductType.FOOD,
  })
  readonly type: ProductType;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: "Product is available or not",
    example: false,
    default: true,
  })
  readonly available?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: "Base64 encoded image",
  })
  readonly image?: string;
}
