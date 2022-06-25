import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, RelationId, UpdateDateColumn } from "typeorm";
import { User } from "../../api/users/entities/user.entity";
import { PushSubscription } from "web-push";

@Entity()
export class NotificationToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "simple-json" })
  pushSubscription: PushSubscription;

  @RelationId((notificationToken: NotificationToken) => notificationToken.user)
  userId?: number;

  @OneToOne(() => User, (user) => user.pushNotificationSubscription, { nullable: true })
  user?: User;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
