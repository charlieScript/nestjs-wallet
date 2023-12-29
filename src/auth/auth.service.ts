import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { BcryptService } from './bcrypt.service';
import { User } from 'src/typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, SignUpDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,

    private usersService: UsersService,
    private bcryptService: BcryptService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findOne(email);
    const mismatch = !(await this.compare(password, user?.passwordHash));

    if (!user || mismatch) {
      this.logger.debug(`User validation failed for ${email}`);
      throw new UnauthorizedException('Please check your login credentials');
    }

    return user;
  }

  async login(data: LoginDto): Promise<any> {
    const user = await this.validateUser(data.email, data.password);
    const payload = { email: user.email, sub: user.id };
    return {
      email: user.email,
      id: user.id,
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(data: SignUpDto): Promise<any> {
    const existingUser = await this.usersService.findOne(data.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    const password = await this.bcryptService.hash(data.password);
    const user = await this.usersService.create(data.email, password);
    const payload = { email: user.email, sub: user.id };
    return {
      email: user.email,
      id: user.id,
      access_token: this.jwtService.sign(payload),
    };
  }

  private async compare(str1: string, str2: string): Promise<boolean> {
    if (!str1 || !str2) return false;

    return this.bcryptService.compare(str1, str2);
  }
}
