import {Injectable} from "@nestjs/common";
import {CreateClientDto} from "./dto/create-client.dto";
import {UpdateClientDto} from "./dto/update-client.dto";
import {InjectConnection, InjectRepository} from "@nestjs/typeorm";
import {Client} from "./entities/client.entity";
import {Connection, Repository} from "typeorm";

@Injectable()
export class ClientsService {
    constructor(
        @InjectRepository(Client) private readonly clientsRepository: Repository<Client>,
        @InjectConnection() private readonly connection: Connection,
    ) {
    }

    findUnlinked() {
        return this.clientsRepository.find({
            relations: ['user'],
            where: {
                user: null,
            }
        });
    }

    create(createClientDto: CreateClientDto) {
        const client = this.clientsRepository.create(createClientDto);
        return this.clientsRepository.save(client);
    }

    findAll() {
        return this.clientsRepository.find({relations: ['user']});
    }

    findOne(id: number) {
        return this.clientsRepository.findOneOrFail(id, {relations: ["user"]});
    }

    async update(id: number, updateClientDto: UpdateClientDto) {
        let client = await this.clientsRepository.findOneOrFail(id, {relations: ["user"]});
        client = this.clientsRepository.merge(client, updateClientDto);
        return this.clientsRepository.save(client);
    }

    async remove(id: number) {
        const client = await this.clientsRepository.findOneOrFail(id);
        return this.clientsRepository.remove(client);
    }
}
