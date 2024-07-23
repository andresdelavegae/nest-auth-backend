import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    //Lo volvemos a poner para cargar las variables de entorno del archivo .env
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      }
    ]), 
    MongooseModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SEED,
      signOptions: {expiresIn: '6h'}
    })
  ]
})
export class AuthModule {}
