import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';
// TODO: Import when available
// import { AwsS3Module } from '../aws-s3/aws-s3.module';
// import { StripeModule } from '../stripe/stripe.module';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    RedisModule,
    // TODO: Uncomment when available
    // AwsS3Module,
    // StripeModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

