import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId, UpdateDateColumn } from "typeorm";
import { User } from "../../api/users/entities/user.entity";

@Entity()
export class NotificationToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  token: string;

  @RelationId((notificationToken: NotificationToken) => notificationToken.user)
  userId?: number;

  @ManyToOne(() => User, (user) => user.notificationTokens, { nullable: true })
  user?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
