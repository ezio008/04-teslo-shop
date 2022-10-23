import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ErrorHandleService } from 'src/common/services/error-handle.service';
import { Logger } from '@nestjs/common/services';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly errorHandle: ErrorHandleService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);
      delete user.password;

      return user;
    } catch (error) {
      this.errorHandle.handleDBExpections(error, this.logger);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, isActive: true },
    });

    if (!user) throw new UnauthorizedException('User not exist');

    if (!user.isActive) throw new UnauthorizedException('User inActive');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Wrong password');

    return user;
  }
}
