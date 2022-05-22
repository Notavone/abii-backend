import {IsBooleanString, IsNumberString, IsOptional} from "class-validator";
import {ApiPropertyOptional} from "@nestjs/swagger";

export class QueryProductDto {
    @IsBooleanString()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Query the related stock changes',
    })
    readonly queryStockChanges?: boolean;

    @IsBooleanString()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Query only products managed by their stock',
    })
    readonly useStock?: boolean;

    @IsNumberString()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Query only products with a price greater than or equal to this value',
    })
    readonly priceFrom?: number;

    @IsNumberString()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Query only products with a price lower than or equal to this value',
    })
    readonly priceTo?: number;

    @IsNumberString()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Query only products with a stock greater than or equal to this value',
    })
    readonly stockFrom?: number;

    @IsNumberString()
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Query only products with a stock lower than or equal to this value',
    })
    readonly stockTo?: number;
}
