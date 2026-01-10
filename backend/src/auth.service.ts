// ============================================
// src/auth.service.ts - COMPLETE FILE (NO CIRCULAR IMPORT!)
// ============================================
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, AuthProvider } from './entities/user.entity';
import { RegisterDto, LoginDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ access_token: string }> {
    const existingUser = await this.usersRepository.findOne({ 
      where: { email: registerDto.email } 
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    const user = this.usersRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      authProvider: AuthProvider.LOCAL,
    });

    await this.usersRepository.save(user);

    return this.generateToken(user);
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.usersRepository.findOne({ 
      where: { email: loginDto.email } 
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  async validateOAuthUser(profile: any, provider: AuthProvider): Promise<User> {
    const email = profile.emails[0].value;
    const providerId = profile.id;

    let user = await this.usersRepository.findOne({
      where: { email, authProvider: provider }
    });

    if (!user) {
      user = this.usersRepository.create({
        email,
        authProvider: provider,
        providerId,
      });
      await this.usersRepository.save(user);
    }

    return user;
  }

  generateToken(user: User): { access_token: string } {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(userId: string): Promise<User> {
    return await this.usersRepository.findOne({ where: { id: userId } });
  }
}


