import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';

@ApiTags('Accounts Api')
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accountService: AccountsService
  ) {}


  @Post('/')
  async test() {
    return {}
  }
}
