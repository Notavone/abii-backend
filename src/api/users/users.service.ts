import {Injectable} from "@nestjs/common";
import {CreateUserDto} from "./dto/create-user.dto";
import {UpdateUserDto} from "./dto/update-user.dto";
import {InjectConnection, InjectRepository} from "@nestjs/typeorm";
import {User} from "./entities/user.entity";
import {Connection, MoreThanOrEqual, Repository} from "typeorm";
import {Cron, CronExpression} from "@nestjs/schedule";
import {MailService} from "../../mail/mail.service";
import {ConfirmUserDto} from "./dto/confirm-user.dto";
import {InitUserPasswordResetDto} from "./dto/init-user-password-reset.dto";
import {FinishUserPasswordResetDto} from "./dto/finish-user-password-reset.dto";
import {v4} from "uuid";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectConnection() private readonly connection: Connection,
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
            await this.mailService.sendConfirmation(user);
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
            const user = await manager.findOne(User, {where: {...body}, relations: ["client"]});
            manager.merge(User, user, {activated: true});
            return manager.save(user);
        });
    }

    initReset(body: InitUserPasswordResetDto) {
        return this.connection.transaction<User>(async (manager) => {
            let user = await manager.findOne(User, {where: {...body}});
            manager.merge(User, user, {resetKey: v4()});
            user = await manager.save(user);
            await this.mailService.sendInitUserPasswordReset(user);
            return user;
        });
    }

    finishReset(body: FinishUserPasswordResetDto) {
        return this.connection.transaction<User>(async (manager) => {
            let user = await manager.findOne(User, {where: {resetKey: body.resetKey}});
            manager.merge(User, user, {resetKey: null, password: body.password});
            user = await manager.save(user);
            await this.mailService.sendFinishUserPasswordReset(user);
            return user;
        });
    }

    findAll() {
        return this.userRepository.find({relations: ["client"]});
    }

    findOne(id: number) {
        return this.userRepository.findOneOrFail(id, {relations: ["client"]});
    }

    async update(user: User, updateUserDto: UpdateUserDto) {
        return this.connection.transaction<User>(async (manager) => {
            const merged = manager.merge(User, user, updateUserDto);
            if (!updateUserDto.client) user.client = null;
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
            relations: ["client"],
        })
            .then((users) => users.forEach((user) => this.userRepository.remove(user)));
    }
}
