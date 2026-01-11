import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Click } from './entities/click.entity';
import { Link } from '../links/entities/link.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Click)
    private clicksRepository: Repository<Click>,
    @InjectRepository(Link)
    private linksRepository: Repository<Link>,
  ) {}

  async getLinkAnalytics(linkId: number, userId: number, days: number = 30) {
    // Verify link belongs to user
    const link = await this.linksRepository.findOne({
      where: { id: linkId, userId },
    });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const clicks = await this.clicksRepository.find({
      where: {
        linkId,
        clickedAt: Between(startDate, new Date()),
      },
      order: { clickedAt: 'DESC' },
    });

    // Group clicks by date
    const clicksByDate = this.groupClicksByDate(clicks);

    // Get top referrers
    const topReferrers = this.getTopReferrers(clicks);

    // Get browser stats from user agents
    const browserStats = this.getBrowserStats(clicks);

    return {
      link: {
        id: link.id,
        shortCode: link.shortCode,
        customAlias: link.customAlias,
        originalUrl: link.originalUrl,
        totalClicks: link.clicksCount,
        createdAt: link.createdAt,
      },
      analytics: {
        totalClicks: clicks.length,
        clicksByDate,
        topReferrers,
        browserStats,
        recentClicks: clicks.slice(0, 10).map((click) => ({
          id: click.id,
          clickedAt: click.clickedAt,
          referer: click.referer,
          userAgent: click.userAgent,
        })),
      },
    };
  }

  async getOverallAnalytics(userId: number, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all user links
    const links = await this.linksRepository.find({
      where: { userId },
    });

    const linkIds = links.map((link) => link.id);

    if (linkIds.length === 0) {
      return {
        totalLinks: 0,
        totalClicks: 0,
        clicksByDate: {},
        topLinks: [],
      };
    }

    // Get all clicks for user's links in date range
    const clicks = await this.clicksRepository
      .createQueryBuilder('click')
      .where('click.linkId IN (:...linkIds)', { linkIds })
      .andWhere('click.clickedAt >= :startDate', { startDate })
      .orderBy('click.clickedAt', 'DESC')
      .getMany();

    const clicksByDate = this.groupClicksByDate(clicks);

    // Get top performing links
    const topLinks = links
      .sort((a, b) => b.clicksCount - a.clicksCount)
      .slice(0, 10)
      .map((link) => ({
        id: link.id,
        shortCode: link.shortCode,
        customAlias: link.customAlias,
        originalUrl: link.originalUrl,
        clicksCount: link.clicksCount,
      }));

    return {
      totalLinks: links.length,
      totalClicks: clicks.length,
      clicksByDate,
      topLinks,
    };
  }

  private groupClicksByDate(clicks: Click[]): Record<string, number> {
    const grouped: Record<string, number> = {};

    clicks.forEach((click) => {
      const date = click.clickedAt.toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return grouped;
  }

  private getTopReferrers(clicks: Click[], limit: number = 10): Array<{ referer: string; count: number }> {
    const refererCounts: Record<string, number> = {};

    clicks.forEach((click) => {
      const referer = click.referer || 'Direct';
      refererCounts[referer] = (refererCounts[referer] || 0) + 1;
    });

    return Object.entries(refererCounts)
      .map(([referer, count]) => ({ referer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  private getBrowserStats(clicks: Click[]): Array<{ browser: string; count: number }> {
    const browserCounts: Record<string, number> = {};

    clicks.forEach((click) => {
      const browser = this.parseBrowser(click.userAgent || '');
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    });

    return Object.entries(browserCounts)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);
  }

  private parseBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Other';
  }
}