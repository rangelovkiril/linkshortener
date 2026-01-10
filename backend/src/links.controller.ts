import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { LinksService } from './links.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateLinkDto, UpdateLinkDto } from './dto';

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post('anonymous')
  async createAnonymousLink(@Body() createLinkDto: CreateLinkDto) {
    return await this.linksService.createAnonymousLink(createLinkDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createUserLink(@Body() createLinkDto: CreateLinkDto, @Req() req) {
    return await this.linksService.createUserLink(createLinkDto, req.user.id);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getUserLinks(@Req() req) {
    return await this.linksService.getUserLinks(req.user.id);
  }

  @Get(':shortCode')
  async redirect(@Param('shortCode') shortCode: string, @Req() req, @Res() res: Response) {
    const originalUrl = await this.linksService.redirectLink(shortCode, req);
    return res.redirect(originalUrl);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateLink(
    @Param('id') id: string,
    @Body() updateLinkDto: UpdateLinkDto,
    @Req() req
  ) {
    return await this.linksService.updateLink(id, req.user.id, updateLinkDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteLink(@Param('id') id: string, @Req() req) {
    await this.linksService.deleteLink(id, req.user.id);
    return { message: 'Link deleted successfully' };
  }

  @Get(':id/statistics')
  @UseGuards(JwtAuthGuard)
  async getStatistics(@Param('id') id: string, @Req() req) {
    return await this.linksService.getLinkStatistics(id, req.user.id);
  }
}