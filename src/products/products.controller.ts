import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Product } from './entities/product.entity';

@ApiTags('Products')
@Controller('products')
// @Auth() //! SI DEFINO EL DECORADOR ACA HACE QUE TODAS LAS RUTAS NECESITEN ESTAR AUTENTICADSAS
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth()
  @ApiResponse({status:201, description:'Product was created', type:Product})
  @ApiResponse({status:400, description:'Bad Request'})
  @ApiResponse({status:403, description:'Forbidden. Token related'})
  create(@Body() createProductDto: CreateProductDto,@GetUser()user:User ) {
    return this.productsService.create(createProductDto,user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    
    
    return this.productsService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.productsService.findOnePlain(term);
  }
  @Auth(ValidRoles.user, ValidRoles.admin)
  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string,
   @Body() updateProductDto: UpdateProductDto,@GetUser()user:User) {
    return this.productsService.update(id, updateProductDto,user);
  }
  @Auth(ValidRoles.user, ValidRoles.admin)
  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
