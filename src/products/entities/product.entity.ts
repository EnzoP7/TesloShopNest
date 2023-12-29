import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({name:'products'})
export class Product {
    @ApiProperty({
        example:'e2ab007d-c543-4993-970d-e463fa5f4226',
        description: 'Product ID',
        uniqueItems:true
    })
    @PrimaryGeneratedColumn('uuid')
    id:string;


    @ApiProperty({
        example:'T-Shirt Teslo',
        description: 'Product Title',
        uniqueItems:true
    })
    @Column('text',{
        unique:true,
    })
    title:string

    @ApiProperty({
        example:'0',
        description: 'Product price'
    })
    @Column(`float`,{
        default:0
    })
    price: number

    @ApiProperty({
        example:'lorem',
        description: 'Product Description',
      default:null
    })
    @Column({
        type:'text',
        nullable:true
    })
    description:string

    @ApiProperty({
        example:'t_Shirt_Teslo',
        description: 'Product SLUG - for SEO Routes',
        uniqueItems:true
    })
    @Column('text',{
        unique:true
    })
    slug:string


    @ApiProperty({
        example:10,
        description: 'Product stock',
        default:0
    })
    @Column('int',{
        default:0
    })
    stock:number


    @ApiProperty({
        example:['M','XL','XXL'],
        description: 'Product Sizes',
     
    })
    @Column('text',{
        array:true
    })
    sizes:string[]

    @ApiProperty({
        example:'Women',
        description: 'Product gender',
     
    })
    @Column('text')
    gender:string


    @ApiProperty()
    @Column('text',{
    array:true,
    default:[]
})
tags:string[]

@ApiProperty()
@OneToMany(
    ()=> ProductImage,
    (productImage) => productImage.product,
    {cascade:true,eager:true}
)
images?: ProductImage[];


@ManyToOne(
    () => User,
    (user) => user.product,
    {eager:true}
)
user:User

    //! GENERAMOS ESTE METODO PARA GENERAR ANTES DE CADA INSERCION EL SLUG DEL PRODUCTO
    @BeforeInsert()
    checkSlugInsert(){
        if(!this.slug) {
            this.slug = this.title
        }
        this.slug = this.slug.toLowerCase().replaceAll(' ','_').replaceAll("'",'')
    }

//! LO MISMO SOLO QUE PARA EL UPDATE
    @BeforeUpdate()
    checkSlugUpdate(){
       
            this.slug = this.slug.toLowerCase().replaceAll(' ','_').replaceAll("'",'')
        
    }
}
