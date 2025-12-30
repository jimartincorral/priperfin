import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    console.log('AppService.getHello called');
    return { message: 'Hello from API', timestamp: new Date().toISOString() };
  }
}
