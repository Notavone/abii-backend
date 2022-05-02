import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, RelationId, UpdateDateColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "../../users/entities/user.entity";
import { JoinColumn } from "typeorm";

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

  @Column("float", { default: 0 })
  @ApiProperty({
    description: "The client balance",
    example: 0,
  })
  balance: number;

  @Column({ nullable: true })
  @ApiProperty({
    description: "Date until the client won't be subscribed",
    nullable: true,
    example: "2020-01-01T00:00:00.000Z",
  })
  subscribedUntil?: Date;

  @OneToOne(() => User, user => user.client, {nullable: true, eager: true, cascade: ["update"] })
  @JoinColumn()
  @ApiProperty({
    description: "The user associated with this client",
    nullable: true,
  })
  user?: User;

  @RelationId((client: Client) => client.user)
  @ApiProperty({
    description: "The id of the user associated with this client",
    nullable: true,
  })
  userId?: number;

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
