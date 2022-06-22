import {Injectable} from "@nestjs/common";
import {CreateProductDto} from "./dto/create-product.dto";
import {UpdateProductDto} from "./dto/update-product.dto";
import {InjectConnection, InjectRepository} from "@nestjs/typeorm";
import {Product} from "./entities/product.entity";
import {Connection, QueryRunner, Repository} from "typeorm";
import {StockChange} from "../stock/entities/stock-change.entity";
import {User} from "../users/entities/user.entity";
import {UpdateProductBulkDto} from "./dto/update-product-bulk.dto";
import {QueryProductDto} from "./dto/query-product.dto";

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product) private readonly productsRepository: Repository<Product>,
        @InjectConnection() private readonly connection: Connection,
    ) {
    }

    create(createProductDto: CreateProductDto) {
        const product = this.productsRepository.create(createProductDto);
        return this.productsRepository.save(product);
    }

    findAll(query?: QueryProductDto) {
        if (query) {
            const qb = this.productsRepository.createQueryBuilder("product");

            if (query.queryStockChanges !== undefined) {
                qb.leftJoinAndSelect("product.stockChanges", "stockChanges");
            }

            if (query.useStock !== undefined) {
                qb.andWhere("product.useStock = :useStock", {useStock: query.useStock ? 1 : 0});
            }

            if (query.priceFrom !== undefined) {
                qb.andWhere("product.price >= :priceFrom", {priceFrom: query.priceFrom});
            }

            if (query.priceTo !== undefined) {
                qb.andWhere("product.price <= :priceTo", {priceTo: query.priceTo});
            }

            if (query.stockFrom) {
                qb.andWhere("product.stock >= :stockFrom", {stockFrom: query.stockFrom});
            }

            if (query.stockTo) {
                qb.andWhere("product.stock <= :stockTo", {stockTo: query.stockTo});
            }

            return qb.getMany();
        } else {
            return this.productsRepository.find();
        }
    }

    findOne(id: number) {
        return this.productsRepository.findOneOrFail(id);
    }

    async updateBulk(updateBulkDto: UpdateProductBulkDto, user: User) {
        const queryRunner = await this.connection.createQueryRunner();
        await queryRunner.startTransaction();
        const updatedProducts = [];
        try {
            for (const product of updateBulkDto.products) {
                let productToUpdate = await this.productsRepository.findOneOrFail(product.id);
                queryRunner.manager.merge(Product, productToUpdate, product);

                if (product.stock !== undefined && (productToUpdate.useStock || product.useStock)) {
                    if (product.stock < 0) throw new Error('Stock cannot be negative');
                    productToUpdate = await ProductsService.updateStock(queryRunner, productToUpdate, product.stock, user);
                }

                await queryRunner.manager.save(productToUpdate);
                updatedProducts.push(productToUpdate);
            }
            await queryRunner.commitTransaction();
            return updatedProducts;
        } catch (e) {
            if (updateBulkDto.useTransaction) {
                await queryRunner.rollbackTransaction();
            }
            throw e;
        } finally {
            await queryRunner.release();
        }
    }

    async update(id: number, updateProductDto: UpdateProductDto, user: User) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let product = await queryRunner.manager.findOneOrFail(Product, id);

            if (updateProductDto.stock !== undefined && (product.useStock || updateProductDto.useStock)) {
                if (updateProductDto.stock < 0) throw new Error('Stock cannot be negative');
                product = await ProductsService.updateStock(queryRunner, product, updateProductDto.stock, user);
            }

            product = queryRunner.manager.merge(Product, product, updateProductDto);
            await queryRunner.manager.save(product);
            await queryRunner.commitTransaction();
            return product;
        } catch (e) {
            await queryRunner.rollbackTransaction();
            throw e;
        } finally {
            await queryRunner.release();
        }
    }

    async remove(id: number) {
        const product = await this.productsRepository.findOneOrFail(id);
        return this.productsRepository.remove(product);
    }

    static async updateStock(queryRunner: QueryRunner, product: Product, newStock: number, user: User) {
        if (product.stock === newStock) return product;

        if (newStock < 0) throw new Error('Stock cannot be negative');

        const stockChange = queryRunner.manager.create(StockChange, {
            product,
            user,
            previousStock: product.stock,
            newStock,
        });
        await queryRunner.manager.save(StockChange, stockChange);
        product.stock = newStock;

        return product;
    }
}
