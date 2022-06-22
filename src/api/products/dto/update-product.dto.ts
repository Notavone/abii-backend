import {ApiPropertyOptional, PartialType} from "@nestjs/swagger";
import {CreateProductDto} from "./create-product.dto";
import {IsBoolean, IsNumber, IsOptional} from "class-validator";

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @IsNumber()
    @IsOptional()
    @ApiPropertyOptional({
        description: "The new stock of the product",
    })
    readonly stock?: number;

    @IsBoolean()
    @IsOptional()
    @ApiPropertyOptional({
        description: "The product is managed by it's stock",
    })
    readonly useStock?: boolean;

    @IsBoolean()
    @IsOptional()
    @ApiPropertyOptional({
        description: "At which stock there is an alert of out of stock",
    })
    readonly alert?: number;
}
