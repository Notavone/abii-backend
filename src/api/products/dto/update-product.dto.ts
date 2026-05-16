import {ApiPropertyOptional, PartialType} from "@nestjs/swagger";
import {CreateProductDto} from "./create-product.dto";
import {IsBoolean, IsNumber, IsOptional} from "class-validator";
import { ProductCategory } from "../entities/product-category.entity";

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

    @IsBoolean()
    @IsOptional()
    @ApiPropertyOptional({
        description: "Whether the product is available",
    })
    readonly available?: boolean;

    @IsNumber()
    @IsOptional()
    @ApiPropertyOptional({
        description: "The new buy price of the product",
    })
    readonly buyPrice?: number;

    @IsNumber()
    @IsOptional()
    @ApiPropertyOptional({
        description: "The new sell price of the product",
    })
    readonly price?: number;

    @IsNumber()
    @IsOptional()
    @ApiPropertyOptional({
        description: "The new discounted price of the product",
    })
    readonly price_red?: number;

    @IsNumber()
    @IsOptional()
    @ApiPropertyOptional({
        description: "The new type of the product",
    })
    readonly type?: number;
    
    @IsOptional()
    @ApiPropertyOptional({
        description: "The categories of the product",
        type: [ProductCategory],
    })
    readonly categories?: ProductCategory[];
}
