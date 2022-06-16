import { Injectable } from "@nestjs/common";
import { InjectConnection, InjectRepository } from "@nestjs/typeorm";
import { Connection, Repository } from "typeorm";
import { ProductsService } from "../products/products.service";
import { Ean } from "./entities/ean.entity";
import { CreateEanDto } from "./dto/create-ean.dto";
import { UpdateEanDto } from "./dto/update-ean.dto";

@Injectable()
export class EanService {

  constructor(
    @InjectRepository(Ean) private readonly eanRepository: Repository<Ean>,
    @InjectConnection() private readonly connection: Connection,
    private readonly productsService: ProductsService,
  ) {
  }

  findAll() {
    return this.eanRepository.find({ relations: ["product"] });
  }

  findOne(id: number) {
    return this.eanRepository.findOneOrFail(id, { relations: ["product"] });
  }

  async create(createEanDto: CreateEanDto) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const product = await this.productsService.findOne(createEanDto.productId);
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

      if (updateEanDto.productId) {
        ean.product = await this.productsService.findOne(updateEanDto.productId);
      }
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
    return await this.eanRepository.remove(ean);
  }
}
