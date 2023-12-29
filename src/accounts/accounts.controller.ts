import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from 'src/auth';
import { GenericStatus } from 'src/core';

@ApiTags('Accounts Api')
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accountService: AccountsService
  ) {}

  @ApiBearerAuth('Bearer')
  @UseGuards(JwtAuthGuard)
  @Get('balance')
  async getBalance(@Request() req) {
    return new GenericStatus({
      status: 200,
      description: 'Balance fetched successfully',
      data: await this.accountService.getBalance(req.user.id)
    })
  }
}
