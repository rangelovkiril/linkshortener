import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { isURL } from 'validator';
import { createHash } from 'crypto';
import { Link } from './entities/link.entity';
import { User } from '../users/entities/user.entity';
import { Click } from '../analytics/entities/click.entity';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private linksRepository: Repository<Link>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Click)
    private clicksRepository: Repository<Click>,
  ) {}

  async create(createLinkDto: CreateLinkDto, userId: number): Promise<Link> {
    // Validate URL
    if (!isURL(createLinkDto.originalUrl, { require_protocol: true })) {
      throw new BadRequestException('Invalid URL format');
    }

    // Get user with subscription limits
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['links'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const limits = user.getSubscriptionLimits();

    // Check if user reached max links limit
    if (limits.maxLinks !== -1 && user.links.length >= limits.maxLinks) {
      throw new ForbiddenException(
        `You have reached the maximum number of links for your ${user.subscriptionLevel} plan (${limits.maxLinks})`,
      );
    }

    // Handle custom alias
    let shortCode: string;
    let customAlias: string | null = null;

    if (createLinkDto.customAlias) {
      // Validate custom alias format (alphanumeric, hyphens, underscores)
      if (!/^[a-zA-Z0-9_-]+$/.test(createLinkDto.customAlias)) {
        throw new BadRequestException(
          'Custom alias can only contain letters, numbers, hyphens, and underscores',
        );
      }

      // Check custom alias limit
      const customAliasCount = user.links.filter((l) => l.customAlias).length;
      if (
        limits.maxCustomAliases !== -1 &&
        customAliasCount >= limits.maxCustomAliases
      ) {
        throw new ForbiddenException(
          `You have reached the maximum number of custom aliases for your ${user.subscriptionLevel} plan (${limits.maxCustomAliases})`,
        );
      }

      // Check if custom alias is available
      const existingAlias = await this.linksRepository.findOne({
        where: { customAlias: createLinkDto.customAlias },
      });

      if (existingAlias) {
        throw new BadRequestException('This custom alias is already taken');
      }

      customAlias = createLinkDto.customAlias;
      shortCode = nanoid(10); // Still generate a short code as fallback
    } else {
      // Generate unique short code
      shortCode = await this.generateUniqueShortCode();
    }

    // Calculate expiration date if provided
    let expiresAt: Date | null = null;
    if (createLinkDto.expirationDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + createLinkDto.expirationDays);
    }

    // Create link
    const link = this.linksRepository.create({
      originalUrl: createLinkDto.originalUrl,
      shortCode,
      customAlias,
      userId,
      expiresAt,
      isActive: true,
      clicksCount: 0,
    });

    return this.linksRepository.save(link);
  }

  async findAll(userId: number): Promise<Link[]> {
    return this.linksRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Link> {
    const link = await this.linksRepository.findOne({
      where: { id, userId },
      relations: ['clicks'],
    });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    return link;
  }

  async findByIdentifier(identifier: string): Promise<Link> {
    const link = await this.linksRepository.findOne({
      where: [{ shortCode: identifier }, { customAlias: identifier }],
    });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    // Check if link is expired
    if (link.isExpired() || !link.isActive) {
      throw new NotFoundException('This link has expired or is no longer active');
    }

    return link;
  }

  async update(
    id: number,
    userId: number,
    updateLinkDto: UpdateLinkDto,
  ): Promise<Link> {
    const link = await this.findOne(id, userId);

    // Update custom alias if provided
    if (updateLinkDto.customAlias) {
      if (!/^[a-zA-Z0-9_-]+$/.test(updateLinkDto.customAlias)) {
        throw new BadRequestException(
          'Custom alias can only contain letters, numbers, hyphens, and underscores',
        );
      }

      const existingAlias = await this.linksRepository.findOne({
        where: { customAlias: updateLinkDto.customAlias },
      });

      if (existingAlias && existingAlias.id !== id) {
        throw new BadRequestException('This custom alias is already taken');
      }

      link.customAlias = updateLinkDto.customAlias;
    }

    if (updateLinkDto.isActive !== undefined) {
      link.isActive = updateLinkDto.isActive;
    }

    return this.linksRepository.save(link);
  }

  async remove(id: number, userId: number): Promise<void> {
    const link = await this.findOne(id, userId);
    await this.linksRepository.remove(link);
  }

  async recordClick(
    linkId: number,
    ipAddress: string,
    userAgent: string,
    referer: string | null,
  ): Promise<void> {
    // Hash IP address for privacy
    const ipHash = createHash('sha256').update(ipAddress).digest('hex');

    const click = this.clicksRepository.create({
      linkId,
      ipAddressHash: ipHash,
      userAgent,
      referer,
      clickedAt: new Date(),
    });

    await this.clicksRepository.save(click);
  }

  async getStats(userId: number) {
    const links = await this.linksRepository.find({
      where: { userId },
    });

    const totalClicks = links.reduce((sum, link) => sum + link.clicksCount, 0);
    const activeLinks = links.filter((link) => link.isActive && !link.isExpired()).length;

    return {
      totalLinks: links.length,
      activeLinks,
      totalClicks,
      links: links.map((link) => ({
        id: link.id,
        shortCode: link.shortCode,
        customAlias: link.customAlias,
        originalUrl: link.originalUrl,
        clicksCount: link.clicksCount,
        createdAt: link.createdAt,
        isActive: link.isActive,
        expiresAt: link.expiresAt,
      })),
    };
  }

  private async generateUniqueShortCode(): Promise<string> {
    let shortCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      shortCode = nanoid(7); // 7 characters for good balance
      const existing = await this.linksRepository.findOne({
        where: { shortCode },
      });

      if (!existing) {
        return shortCode;
      }

      attempts++;
    } while (attempts < maxAttempts);

    // If collision after max attempts, use longer code
    return nanoid(10);
  }
}