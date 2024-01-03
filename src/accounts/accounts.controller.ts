import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from 'src/auth';
import { GenericStatus } from 'src/core';
import { ChargeCardDto } from './dtos/account.dto';

@ApiTags('Accounts Api')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountService: AccountsService) {}

  @ApiBearerAuth('Bearer')
  @UseGuards(JwtAuthGuard)
  @Get('balance')
  async getBalance(@Request() req) {
    return new GenericStatus({
      status: 200,
      description: 'Balance fetched successfully',
      data: await this.accountService.getBalance(req.user.id),
    });
  }

  @ApiBearerAuth('Bearer')
  @UseGuards(JwtAuthGuard)
  @Post('fund')
  async cardFunding(@Request() req, @Body() data: ChargeCardDto) {
    return new GenericStatus({
      status: 200,
      description: 'Funded successfully',
      data: await this.accountService.cardFunding(data, req.user),
    });
  }
}
