import {UpdateProductDto} from "./update-product.dto";
import {Product} from "../entities/product.entity";
import {IsArray, IsBoolean} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class UpdateProductBulkDto {
    @IsArray()
    @ApiProperty({
        description: 'Products to update',
    })
    readonly products: ({} & UpdateProductDto & Pick<Product, 'id'>)[];

    @IsBoolean()
    @ApiProperty({
        description: 'Whether to rollback if any error occurs',
    })
    readonly useTransaction: boolean;
}
