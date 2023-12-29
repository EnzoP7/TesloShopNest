import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt  from 'bcrypt'
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class AuthService {
  private readonly logger = new Logger('userService')
 

  constructor(
@InjectRepository(User)
private readonly userRepository:Repository<User>,
private readonly jwtService:JwtService
  ){}
  
  private handleDBExceptions(error: any) : never{ //! el never significa que no devuelve nada

    if(error.code === '23505')//! Quiere decir si el error es un string
        throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException("Unexpected error,check server logs");
  }

  private getJwtToken(payload: JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
     }

  async create(createUserDto: CreateUserDto) {
    try {
      const {password,...userData} = createUserDto
      const user =  this.userRepository.create({
        ...userData ,
        password:bcrypt.hashSync(password,10)
      } ); 
      await this.userRepository.save(user)
      delete user.password;
      return {
        ...user,
        token:this.getJwtToken({ id: user.id})
      };

    } catch (error) {
      this.handleDBExceptions(error);
      
    }

  }


  async checkAuthStatus(user: User){

    return {
      ...user,
      token:this.getJwtToken({ id: user.id})
    };
  }


 async login(loginUserDto:LoginUserDto){

  try {
    const {password,email} = loginUserDto;

    const user = await this.userRepository.findOne({
      where:{ email },
      select:{email:true,password:true,id:true}
    })
    if(!user) throw new UnauthorizedException('Credential are not valid ( email) ')


    if(!bcrypt.compareSync(password,user.password)) {
      throw new UnauthorizedException('Credential are not valid ( password ) ')
    }
    return {
      ...user,
      token:this.getJwtToken({ id: user.id})
    };


  } catch (error) {
    this.handleDBExceptions(error);
  }

 }




}
