import { IsNumber, IsOptional } from "class-validator";

export class QueryClientDto {
  @IsNumber()
  @IsOptional()
  clientId?: number | null;
}
