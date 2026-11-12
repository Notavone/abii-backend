import {Injectable} from "@nestjs/common";
import {CreateClientDto} from "./dto/create-client.dto";
import {UpdateClientDto} from "./dto/update-client.dto";
import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import {Client} from "./entities/client.entity";
import {DataSource, IsNull, Repository} from "typeorm";

@Injectable()
export class ClientsService {
    constructor(
        @InjectRepository(Client) private readonly clientsRepository: Repository<Client>,
        @InjectDataSource() private readonly connection: DataSource,
    ) {
    }

    findUnlinked() {
        return this.clientsRepository.find({
            relations: { user: true },
            where: {
                user: IsNull(),
            }
        });
    }

    create(createClientDto: CreateClientDto) {
        const client = this.clientsRepository.create(createClientDto);
        return this.clientsRepository.save(client);
    }

    findAll() {
        return this.clientsRepository.find({relations: { user: true }});
    }

    findOne(id: number) {
        return this.clientsRepository.findOneOrFail({ where: { id: id }, ...{relations: { user: true }} });
    }

    async update(id: number, updateClientDto: UpdateClientDto) {
        let client = await this.clientsRepository.findOneOrFail({ where: { id: id }, ...{relations: { user: true }} });
        client = this.clientsRepository.merge(client, updateClientDto);
        return this.clientsRepository.save(client);
    }

    async remove(id: number) {
        const client = await this.clientsRepository.findOneOrFail({ where: { id: id } });
        return this.clientsRepository.remove(client);
    }
}
