import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('links')
@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new short link' })
  create(@Body() createLinkDto: CreateLinkDto, @Request() req) {
    return this.linksService.create(createLinkDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all links for current user' })
  findAll(@Request() req) {
    return this.linksService.findAll(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get statistics for current user' })
  getStats(@Request() req) {
    return this.linksService.getStats(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific link' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.linksService.findOne(+id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a link' })
  update(
    @Param('id') id: string,
    @Body() updateLinkDto: UpdateLinkDto,
    @Request() req,
  ) {
    return this.linksService.update(+id, req.user.userId, updateLinkDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a link' })
  remove(@Param('id') id: string, @Request() req) {
    return this.linksService.remove(+id, req.user.userId);
  }
}

// Separate controller for redirect (no auth required)
@Controller()
export class RedirectController {
  constructor(private readonly linksService: LinksService) {}

  @Get(':identifier')
  @ApiOperation({ summary: 'Redirect to original URL' })
  async redirect(
    @Param('identifier') identifier: string,
    @Req() req,
    @Res() res: Response,
  ) {
    const link = await this.linksService.findByIdentifier(identifier);

    // Record click
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || null;

    await this.linksService.recordClick(
      link.id,
      ipAddress,
      userAgent,
      referer,
    );

    // Redirect to original URL
    return res.redirect(301, link.originalUrl);
  }
}