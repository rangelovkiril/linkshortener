
// ============================================
// SERVICES
// ============================================

// links.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Link } from './entities/link.entity';
import { User, SubscriptionTier } from './entities/user.entity';
import { LinkStatistic, StatisticType } from './entities/link-statistic.entity';
import { CreateLinkDto, UpdateLinkDto, TimeUnit } from './dto';
import * as crypto from 'crypto';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private linksRepository: Repository<Link>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(LinkStatistic)
    private statisticsRepository: Repository<LinkStatistic>,
  ) {}

  private generateShortCode(): string {
    return crypto.randomBytes(6).toString('base64url').substring(0, 8);
  }

  private calculateExpiry(value?: number, unit?: TimeUnit, tier?: SubscriptionTier): Date {
    const now = new Date();
    
    if (!value || !unit) {
      return new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
    }

    const multipliers = {
      [TimeUnit.MINUTES]: 60 * 1000,
      [TimeUnit.HOURS]: 60 * 60 * 1000,
      [TimeUnit.DAYS]: 24 * 60 * 60 * 1000,
      [TimeUnit.MONTHS]: 30 * 24 * 60 * 60 * 1000,
      [TimeUnit.YEARS]: 365 * 24 * 60 * 60 * 1000,
    };

    return new Date(now.getTime() + value * multipliers[unit]);
  }

  async createAnonymousLink(createLinkDto: CreateLinkDto): Promise<Link> {
    const shortCode = this.generateShortCode();
    const expiresAt = this.calculateExpiry();

    const link = this.linksRepository.create({
      shortCode,
      originalUrl: createLinkDto.originalUrl,
      expiresAt,
      isCustomSlug: false,
    });

    return await this.linksRepository.save(link);
  }

  async createUserLink(createLinkDto: CreateLinkDto, userId: string): Promise<Link> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let shortCode: string;
    let isCustomSlug = false;

    if (createLinkDto.customSlug) {
      if (user.subscriptionTier === SubscriptionTier.FREE) {
        throw new ForbiddenException('Custom slugs require Extended tier or higher');
      }

      const existing = await this.linksRepository.findOne({ 
        where: { shortCode: createLinkDto.customSlug } 
      });
      
      if (existing) {
        throw new BadRequestException('Custom slug already taken');
      }

      shortCode = createLinkDto.customSlug;
      isCustomSlug = true;
    } else {
      shortCode = this.generateShortCode();
    }

    const expiresAt = user.subscriptionTier === SubscriptionTier.FREE
      ? this.calculateExpiry()
      : this.calculateExpiry(createLinkDto.expiryValue, createLinkDto.expiryUnit, user.subscriptionTier);

    const link = this.linksRepository.create({
      shortCode,
      originalUrl: createLinkDto.originalUrl,
      label: createLinkDto.label,
      expiresAt,
      isCustomSlug,
      userId,
    });

    return await this.linksRepository.save(link);
  }

  async getUserLinks(userId: string): Promise<Link[]> {
    return await this.linksRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateLink(linkId: string, userId: string, updateLinkDto: UpdateLinkDto): Promise<Link> {
    const link = await this.linksRepository.findOne({ 
      where: { id: linkId },
      relations: ['user']
    });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    if (link.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this link');
    }

    if (updateLinkDto.label !== undefined) {
      link.label = updateLinkDto.label;
    }

    if (updateLinkDto.originalUrl) {
      link.originalUrl = updateLinkDto.originalUrl;
    }

    if (updateLinkDto.expiryValue && updateLinkDto.expiryUnit) {
      if (link.user.subscriptionTier === SubscriptionTier.FREE) {
        throw new ForbiddenException('Custom expiry requires Extended tier or higher');
      }
      link.expiresAt = this.calculateExpiry(updateLinkDto.expiryValue, updateLinkDto.expiryUnit);
    }

    return await this.linksRepository.save(link);
  }

  async deleteLink(linkId: string, userId: string): Promise<void> {
    const link = await this.linksRepository.findOne({ where: { id: linkId } });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    if (link.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this link');
    }

    await this.linksRepository.remove(link);
  }

  async redirectLink(shortCode: string, request: any): Promise<string> {
    const link = await this.linksRepository.findOne({ 
      where: { 
        shortCode,
        expiresAt: MoreThan(new Date())
      },
      relations: ['user']
    });

    if (!link) {
      throw new NotFoundException('Link not found or expired');
    }

    if (link.user && link.user.subscriptionTier === SubscriptionTier.ULTIMATE) {
      await this.trackStatistics(link.id, request);
    }

    return link.originalUrl;
  }

  private async trackStatistics(linkId: string, request: any): Promise<void> {
    const stats = [
      {
        linkId,
        type: StatisticType.CLICK,
        data: { timestamp: new Date() }
      },
      {
        linkId,
        type: StatisticType.REFERRER,
        data: { referrer: request.headers.referer || 'direct' }
      },
      {
        linkId,
        type: StatisticType.BROWSER,
        data: { userAgent: request.headers['user-agent'] }
      }
    ];

    await this.statisticsRepository.save(stats);
  }

  async getLinkStatistics(linkId: string, userId: string): Promise<any> {
    const link = await this.linksRepository.findOne({ 
      where: { id: linkId },
      relations: ['user', 'statistics']
    });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    if (link.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    if (link.user.subscriptionTier !== SubscriptionTier.ULTIMATE) {
      throw new ForbiddenException('Statistics require Ultimate tier');
    }

    const stats = await this.statisticsRepository.find({ 
      where: { linkId },
      order: { createdAt: 'DESC' }
    });

    return {
      totalClicks: stats.filter(s => s.type === StatisticType.CLICK).length,
      statistics: stats
    };
  }
}
