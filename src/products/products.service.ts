import { Injectable } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { Repository } from "typeorm";

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private readonly productsRepository: Repository<Product>) {
  }

  create(createProductDto: CreateProductDto) {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  findAll() {
    return this.productsRepository.find();
  }

  findOne(id: number) {
    return this.productsRepository.findOneOrFail(id);
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    let product = await this.productsRepository.findOneOrFail(id);
    product = this.productsRepository.merge(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.productsRepository.findOneOrFail(id);
    return this.productsRepository.remove(product);
  }
}
