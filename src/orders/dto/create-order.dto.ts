import {CreateOrderLineDto} from "./create-order-line.dto";
import {ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, Length} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class CreateOrderDto {
    @IsNumber()
    @ApiProperty({
        description: "The id of the client",
    })
    clientId: number;

    @ArrayNotEmpty()
    @IsArray()
    @ApiProperty({
        description: "The lines of the order",
    })
    orderLines: CreateOrderLineDto[];
}
