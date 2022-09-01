import {Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, RelationId, UpdateDateColumn} from "typeorm";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {User} from "../../users/entities/user.entity";
import { Expose } from "class-transformer";

@Entity()
export class Client {
    @PrimaryGeneratedColumn()
    @ApiProperty({
        description: "The id of the client",
        example: 1,
    })
    id: number;

    @Column()
    @ApiProperty({
        description: "The name of the client",
        example: "John Doe",
    })
    name: string;

    @Column("float", {default: 0})
    @ApiProperty({
        description: "The client balance",
        example: 0,
    })
    balance: number;

    @Column({nullable: true})
    @ApiProperty({
        description: "Date until the client won't be subscribed",
        nullable: true,
        example: "2020-01-01T00:00:00.000Z",
    })
    subscribedUntil?: Date;

    @OneToOne(() => User, user => user.client, {nullable: true, cascade: ["update"], onDelete: "SET NULL"})
    @JoinColumn()
    @ApiPropertyOptional({
        description: "The user associated with this client",
        nullable: true,
    })
    user?: User;

    @RelationId((client: Client) => client.user)
    @ApiPropertyOptional({
        description: "The id of the user associated with this client",
        nullable: true,
    })
    userId?: number;

    @Expose()
    get shortName(): string {
        return this.name.split(" ")[0] + " " + this.name.split(" ")[1].charAt(0) + ".";
    }

    @CreateDateColumn()
    @ApiProperty({
        description: "The date of the creation of the client",
        example: "2020-01-01T00:00:00.000Z",
    })
    createdAt: Date;

    @UpdateDateColumn()
    @ApiProperty({
        description: "The date of the last update of the client",
        example: "2020-01-01T00:00:00.000Z",
    })
    updatedAt: Date;
}
