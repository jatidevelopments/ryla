import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AwsS3Service } from './services/aws-s3.service';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [AwsS3Service],
  exports: [AwsS3Service],
})
export class AwsS3Module { }

