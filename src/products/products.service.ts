import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { Logger } from '@nestjs/common/services';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ErrorHandleService } from 'src/common/services/error-handle.service';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly errorHandle: ErrorHandleService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const product = this.productRepository.create(createProductDto);

      await this.productRepository.save(product);

      return product;
    } catch (error) {
      this.errorHandle.handleDBExpections(error, this.logger);
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<Product[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.productRepository.find({
      take: limit,
      skip: offset,
      //TODO relaciones
    });
  }

  async findOne(term: string): Promise<Product> {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      term = term.toLowerCase();
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('lower(title) =:title or slug =:slug', {
          title: term,
          slug: term,
        })
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Product with term "${term}" not found`);
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
    });

    if (!product)
      throw new NotFoundException(`Product with id "${id}" not found`);

    try {
      await this.productRepository.save(product);

      return product;
    } catch (error) {
      this.errorHandle.handleDBExpections(error, this.logger);
    }
  }

  async remove(id: string): Promise<number> {
    const { affected = 0 } = await this.productRepository.delete({ id });

    if (affected === 0) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    return affected;
  }
}
