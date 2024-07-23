import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, UpdateAuthDto, LoginDto, RegisterUserDto } from './dto'

import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';

import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

@Injectable()
export class AuthService {

  constructor(@InjectModel(User.name)
  private userModel: Model<User>,
    private jwtService: JwtService
  ) {

  }
  async create(createAuthDto: CreateUserDto): Promise<User> {

    try {
      const { password, ...userData } = createAuthDto;
      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData
      });


      await newUser.save();
      const { password: _, ...user } = newUser.toJSON()
      return user;
    }
    catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`${createAuthDto.email} already exist!`)
      }
      throw new InternalServerErrorException('Something happen')

    }

  }

  async register(registerUserDto: RegisterUserDto): Promise<LoginResponse> {
    //Como el metodo de crear requiere que sea del objeto CreateUserDto y nosotros lo tenemos de RegisterUserDto, no hay problema
    //porque como tiene los mismos nombres de propiedades, typescript lo deja pasar
    const user = await this.create(registerUserDto);

   
    return {
      user: user,
      token: this.getJwToken({id: user._id})
    }
  }
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new UnauthorizedException('Not valid email');

    }

    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not valid password');
    }

    const { password: _, ...user2 } = user.toJSON();

    return {
      user: user2,
      token: this.getJwToken({ id: user.id })
    }



  }

  async findUserById(id:string) {
    const user =await  this.userModel.findById(id);
    const {password, ...rest} = user.toJSON();
    return rest;
  }

  getJwToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;

  }

  findAll() : Promise<User[]>{
 return this.userModel.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
