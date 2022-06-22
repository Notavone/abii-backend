import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/typeorm";
import { Connection } from "typeorm";
import { Ean } from "./entities/ean.entity";
import { CreateEanDto } from "./dto/create-ean.dto";
import { UpdateEanDto } from "./dto/update-ean.dto";
import { Product } from "../products/entities/product.entity";

@Injectable()
export class EanService {

  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {
  }

  findAll() {
    return this.connection.manager.find(Ean, { relations: ["product"] });
  }

  findOne(id: number) {
    return this.connection.manager.findOneOrFail(Ean, id, { relations: ["product"] });
  }

  findOneByValue(value: string) {
    return this.connection.manager.findOneOrFail(Ean, { value }, { relations: ["product"] });
  }

  async create(createEanDto: CreateEanDto) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const product = await this.connection.manager.findOne(Product, { id: createEanDto.productId });
      let ean = queryRunner.manager.create(Ean, createEanDto);
      ean.product = product;
      ean = await queryRunner.manager.save(Ean, ean);
      await queryRunner.commitTransaction();
      return ean;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updateEanDto: UpdateEanDto) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let ean = await this.findOne(id);

      ean.product = await queryRunner.manager.findOne(Product, { id: updateEanDto.productId }) ?? null;
      ean = await queryRunner.manager.save(Ean, queryRunner.manager.merge(Ean, ean, updateEanDto));

      await queryRunner.commitTransaction();
      return ean;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: number) {
    let ean = await this.findOne(id);
    return await this.connection.manager.remove(Ean, ean);
  }
}
