import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { ApiTokenService } from './api-token.service';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, ApiTokenService, SessionAuthGuard],
  exports: [AuthService, ApiTokenService, SessionAuthGuard],
})
export class AuthModule {}
