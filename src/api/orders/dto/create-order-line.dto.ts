import { IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderLineDto {
  @IsNumber()
  @ApiProperty({
    description: "The product id",
    example: 1,
  })
  productId: number;

  @IsNumber()
  @ApiProperty({
    description: "The quantity ordered",
    example: 1,
  })
  quantity: number;
}
