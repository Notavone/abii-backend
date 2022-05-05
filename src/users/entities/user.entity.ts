import {AfterLoad, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Generated, OneToOne, PrimaryGeneratedColumn, RelationId, UpdateDateColumn} from "typeorm";
import {Exclude, Expose} from "class-transformer";
import {Authority} from "../../auth/policies/authority";
import {ApiHideProperty, ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {hash} from "bcrypt";
import {Client} from "../../clients/entities/client.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    @ApiProperty({
        description: "The unique identifier of the user",
        example: 1,
    })
    id: number;

    @Column({unique: true})
    @ApiProperty({
        description: "The unique email of the user",
        example: "john",
    })
    email: string;

    @Exclude()
    @Column()
    @ApiHideProperty()
    password: string;

    @Generated("uuid")
    @Exclude()
    @Column()
    @ApiHideProperty()
    uuid: string;

    @Generated("uuid")
    @Exclude()
    @Column()
    @ApiHideProperty()
    activationKey: string;

    @Column({default: false})
    @ApiProperty({
        description: "If the user is able to connect or not",
        example: false,
    })
    activated: boolean;

    @Column({unique: true})
    @ApiProperty({
        description: "The unique username of the user",
        example: "sample@email.com",
    })
    username: string;

    @Column()
    @ApiProperty({
        description: "The first name of the user",
        example: "John",
    })
    firstName: string;

    @Column()
    @ApiProperty({
        description: "The last name of the user",
        example: "Doe",
    })
    lastName: string;

    @Column("simple-array", {nullable: true})
    @ApiPropertyOptional({
        description: "The authorities of the user",
        example: [Authority.ADMIN],
        nullable: true,
    })
    authorities?: Authority[];

    @OneToOne(() => Client, client => client.user, {nullable: true, onDelete: "SET NULL"})
    @ApiPropertyOptional({
        description: "The client associated to the user",
        nullable: true,
    })
    client?: Client;

    @ApiPropertyOptional({
        description: "The id of the client associated to this user",
        nullable: true,
    })
    @RelationId((user: User) => user.client)
    clientId?: number;

    @CreateDateColumn()
    @ApiProperty({
        description: "The date of creation of the user",
        example: "2020-01-01T00:00:00.000Z",
    })
    createdAt: Date;

    @UpdateDateColumn()
    @ApiProperty({
        description: "The date of last update of the user",
        example: "2020-01-01T00:00:00.000Z",
    })
    updatedAt: Date;

    @Expose()
    @ApiProperty({
        description: "The full name of the user",
        example: "John Doe",
    })
    get name(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    @Exclude()
    @ApiHideProperty()
    private tempPassword: string;

    @AfterLoad()
    async storeHash() {
        this.tempPassword = this.password;
    }

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void> {
        console.log(this.tempPassword);
        if (this.password !== this.tempPassword) {
            this.password = await hash(this.password, 10);
        }
    }
}
