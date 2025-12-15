import { Module } from '@nestjs/common';

import { AwsS3Service } from './services/aws-s3.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AwsS3Service],
  exports: [AwsS3Service],
})
export class AwsS3Module {}

