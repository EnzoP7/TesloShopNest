import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import {validate as isUUID} from 'uuid'
import { ProductImage } from './entities/product-image.entity';
import { url } from 'inspector';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

private readonly logger = new Logger('ProductsService') //! ESTO ES PA QUE EN LA CONSOLA SALGA MAS ENTENDIBLE


constructor(
  @InjectRepository(Product)
  private readonly productRepository: Repository<Product>,

  @InjectRepository(ProductImage)
  private readonly productImageRepository: Repository<ProductImage>,

//! eldatsource sabe la cual es la cadena de conmexion que estoy utilizando
  private readonly dataSource:DataSource
){}

  async create(createProductDto: CreateProductDto,user:User) {
    try {
      const {images = [] , ...productDetails} = createProductDto
      const producto = this.productRepository.create({
        ...productDetails,
         images:images.map(image => this.productImageRepository.create({url:image})),
         user:user
        })
      await this.productRepository.save(producto);
      return {...producto,images:images}

    } catch (error) {
    
      this.handleDBExceptions(error)
    }
  }

 async  findAll(paginationdto:PaginationDto) {
   const {limit = 10, offset=0} = paginationdto
    const products = await this.productRepository.find({
  take:limit,
  skip:offset,
  relations:{
    images:true,
  }
   });

   return products.map(product => ({
    ...product,
    images:product.images.map(img => img.url)
   }))
  }

  async findOne(term: string) {
   try {
    let product:Product
    if(isUUID(term)){
      product = await this.productRepository.findOneBy({id:term})
    } else{
      // product = await this.productRepository.findOneBy({slug:term})
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
      .where(`UPPER(title) =:title or slug =:slug`,{
        title:term.toUpperCase(),
        slug:term.toLowerCase()
      }).leftJoinAndSelect('prod.images','prodImages')
      .getOne();
    }


 if(!product)  throw new NotFoundException(`product with ${term} not found`)

    return product
   
    
   } catch (error) {
    this.handleDBExceptions(error)
   }
  }

async findOnePlain(term:string){
  const { images = [],...rest} = await this.findOne(term);
  return {
    ...rest,
    images:images.map(image => image.url)
  }
}


  async update(id: string, updateProductDto: UpdateProductDto,user:User) {
  
   const {images, ...toUpdate} = updateProductDto
   
    const product = await this.productRepository.preload({
       id,
      ...toUpdate,
     
    });
  
    
    if(!product) throw new NotFoundException(`No se ha encontrado un producto con el id ${id}`)

    //create query runner
    const queryRunner=this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction()

    try {

if(images){
  await queryRunner.manager.delete(ProductImage, {product:{id}})
product.images = images.map(image => this.productImageRepository.create({url:image}))
}else{

}

    product.user= user;
      await queryRunner.manager.save(product);


      

      await queryRunner.commitTransaction();
      await queryRunner.release();
      
      return this.findOnePlain(id)
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error)
    }
   

  
   
 }
  // async update(id: string, updateProductDto: UpdateProductDto) {
  //   try {
  //     const product = await this.productRepository.findOneBy({id});
  
  //     if (!product) {
  //       throw new NotFoundException(`No se ha encontrado un producto con el id ${id}`);
  //     }
  
  //     // Actualiza solo las propiedades definidas en updateProductDto
  //     Object.assign(product, updateProductDto);
  
  //     await this.productRepository.save(product);
  
  //     return product;
  //   } catch (error) {
  //     this.handleDBExceptions(error);
  //     throw error; // Lanza el error para que pueda ser manejado por el controlador
  //   }
  // }

  async remove(id: string) {
    try {
      const productoEncontrado = await this.productRepository.findOneBy({id});
      if(!productoEncontrado) {
        throw new NotFoundException(`No se ha encontrado un producto con el id ${id}`)      
      }
      await this.productRepository.remove(productoEncontrado);
      return "PRODUCTO ELIMINADO CON EXITO";
      
     } catch (error) {
      this.handleDBExceptions(error)
     }
  }


  private handleDBExceptions(error: any){

    if(error.code === '23505')//! Quiere decir si el error es un string
        throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException("Unexpected error,check server logs");
  }

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) { 
      this.handleDBExceptions(error)
    }
  }
}
