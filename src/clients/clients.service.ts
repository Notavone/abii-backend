import { Injectable } from "@nestjs/common";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { InjectConnection, InjectRepository } from "@nestjs/typeorm";
import { Client } from "./entities/client.entity";
import { Connection, Repository } from "typeorm";
import { QueryClientDto } from "./dto/query-client.dto";

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client) private readonly clientsRepository: Repository<Client>,
    @InjectConnection() private readonly connection: Connection,
  ) {
  }

  create(createClientDto: CreateClientDto) {
    const client = this.clientsRepository.create(createClientDto);
    return this.clientsRepository.save(client);
  }

  findAll(query?: QueryClientDto) {
    const queryBuilder = this.connection.createQueryBuilder(Client, "client");
    if (query.clientId) {
      queryBuilder.where("client.clientId = :clientId", { clientId: query.clientId });
    }
    queryBuilder.leftJoinAndSelect("client.user", "user");

    return queryBuilder.getMany();
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
