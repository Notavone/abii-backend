import {ApiProperty, PickType} from "@nestjs/swagger";
import {CreateUserDto} from "./create-user.dto";
import {IsString, IsUUID} from "class-validator";

export class FinishUserPasswordResetDto extends PickType(CreateUserDto, ['password'] as const) {
    @IsUUID("4")
    @IsString()
    @ApiProperty({
        description: "The reset key that this user has received by mail"
    })
    resetKey: string;
}
