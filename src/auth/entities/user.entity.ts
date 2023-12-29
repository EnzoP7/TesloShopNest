import { IsString } from "class-validator";
import { Product } from "src/products/entities/product.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'users'})
export class User {
    
    
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column('text',{
        unique:true
    })
    
    email:string;

    @Column('text',{
        select:false //! PARA QUE NO SE MUESTRE LA PASSWORD EN LAS PETICIONES
    })
    password:string;

    @Column('text',{
        unique:true
    })
    fullName: string;


    @Column('bool',{
        default:true
    })
    isActive:boolean;
    
    
    @Column('text',{
        array:true,
        default:['user']
    })
    roles:string[];


    @OneToMany(
        ()=>Product ,
        (product) => product.user
    )
    product:Product;


    @BeforeInsert()
    checjFieldsBeforeInsert(){
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate(){
        this.checjFieldsBeforeInsert();
    }
}
