import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinksService } from './links.service';
import { LinksController } from './links.controller';
import { Link } from './entities/link.entity';
import { User } from '../users/entities/user.entity';
import { Click } from '../analytics/entities/click.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Link, User, Click])],
  controllers: [LinksController],
  providers: [LinksService],
  exports: [LinksService],
})
export class LinksModule {}