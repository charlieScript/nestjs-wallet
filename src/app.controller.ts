import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor() {}

  @ApiResponse({
    status: 200,
    description: 'Okay',
  })
  @Get('/health')
  healthCheck() {
    return {
      status: true,
      msg: 'Okay',
    };
  }
}
