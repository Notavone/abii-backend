import {IsBooleanString, IsNumberString, IsOptional} from "class-validator";

export class QueryOrderDto {
  @IsNumberString()
  @IsOptional()
  readonly clientId?: number;

  @IsNumberString()
  @IsOptional()
  readonly fromTimestamp?: number;

  @IsNumberString()
  @IsOptional()
  readonly toTimestamp?: number;

  @IsNumberString()
  @IsOptional()
  readonly productId?: number;

  @IsNumberString()
  @IsOptional()
  readonly sellerId?: number;

  @IsBooleanString()
  @IsOptional()
  readonly allowRefunded?: boolean;

  @IsBooleanString()
  @IsOptional()
  readonly allowIncomplete?: boolean;
}
