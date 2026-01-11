import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('link/:id')
  @ApiOperation({ summary: 'Get analytics for a specific link' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getLinkAnalytics(
    @Param('id') id: string,
    @Query('days') days: string,
    @Request() req,
  ) {
    const daysParsed = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getLinkAnalytics(
      +id,
      req.user.userId,
      daysParsed,
    );
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get overall analytics for all user links' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getOverallAnalytics(@Query('days') days: string, @Request() req) {
    const daysParsed = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getOverallAnalytics(req.user.userId, daysParsed);
  }
}