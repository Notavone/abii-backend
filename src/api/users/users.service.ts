import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { DataSource, MoreThanOrEqual, Repository } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MailService } from "../../mail/mail.service";
import { ConfirmUserDto } from "./dto/confirm-user.dto";
import { InitUserPasswordResetDto } from "./dto/init-user-password-reset.dto";
import { FinishUserPasswordResetDto } from "./dto/finish-user-password-reset.dto";
import { randomUUID as v4 } from "crypto";
import { Authority } from "../auth/policies/authority";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectDataSource() private readonly connection: DataSource,
    private readonly mailService: MailService,
  ) {
  }

  async create(createUserDto: CreateUserDto) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = queryRunner.manager.create(User, createUserDto);
      await queryRunner.manager.save(user);
      //await this.mailService.sendConfirmation(user);
      await queryRunner.commitTransaction();
      return user;
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  confirm(body: ConfirmUserDto) {
    return this.connection.transaction<User>(async (manager) => {
      if (!body.activationKey) throw new BadRequestException();
      const user = await manager.findOne(User, { where: { activationKey: body.activationKey }, relations: { client: true } });
      if (!user) throw new BadRequestException();
      manager.merge(User, user, { activated: true });
      return manager.save(user);
    });
  }

  async initReset(body: InitUserPasswordResetDto) {
    // Réponse identique que l'e-mail existe ou non (pas d'énumération de comptes)
    await this.connection.transaction(async (manager) => {
      if (!body.email) return;
      let user = await manager.findOne(User, { where: { email: body.email } });
      if (!user) return;
      manager.merge(User, user, { resetKey: v4() });
      user = await manager.save(user);
      //await this.mailService.sendInitUserPasswordReset(user);
    });
    return {};
  }

  finishReset(body: FinishUserPasswordResetDto) {
    return this.connection.transaction<User>(async (manager) => {
      if (!body.resetKey || !body.password) throw new BadRequestException();
      let user = await manager.findOne(User, { where: { resetKey: body.resetKey } });
      if (!user) throw new BadRequestException();
      manager.merge(User, user, { resetKey: null, password: body.password });
      user = await manager.save(user);
      //await this.mailService.sendFinishUserPasswordReset(user);
      return user;
    });
  }

  findAll() {
    return this.userRepository.find({ relations: { client: true } });
  }

  findOne(id: number) {
    return this.userRepository.findOneOrFail({ where: { id: id }, ...{ relations: { client: true } } });
  }

  getSellers() {
    return this.userRepository.createQueryBuilder("user")
      .andWhere("user.authorities like :seller", { seller: `%${Authority.USER_SELLER}%` })
      .orWhere("user.authorities like :admin", {admin: `%${Authority.ADMIN}%`})
      .getMany();
  }

  async update(user: User, updateUserDto: UpdateUserDto) {
    return this.connection.transaction<User>(async (manager) => {
      const merged = manager.merge(User, user, updateUserDto);
      if ("client" in updateUserDto && !updateUserDto.client) user.client = null;
      return manager.save(merged);
    });
  }

  async remove(user: User) {
    return this.userRepository.remove(user);
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  deleteInactive() {
    this.userRepository.find({
      where: {
        activated: false,
        createdAt: MoreThanOrEqual(new Date(Date.now() - 7200000)),
      },
      relations: { client: true },
    })
      .then((users) => users.forEach((user) => this.userRepository.remove(user)));
  }
}
