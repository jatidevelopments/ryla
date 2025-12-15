import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { v4 } from 'uuid';

import { REDIS_CLIENT } from '../redis.constants';

@Injectable()
export class RedisLeaderElectionService {
  private readonly logger = new Logger(RedisLeaderElectionService.name);
  private readonly leaderTTL = 300; // 30 seconds
  private instanceId: string;
  private electionIntervals: Map<string, NodeJS.Timeout> = new Map();
  private leaderStatus: Map<string, boolean> = new Map();

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {
    this.instanceId = `${v4()}`;
  }

  public async registerCronJob(jobName: string): Promise<void> {
    if (this.electionIntervals.has(jobName)) {
      return;
    }

    const interval = setInterval(async () => {
      await this.tryBecomeLeader(jobName);
    }, 10000);

    this.electionIntervals.set(jobName, interval);
    await this.tryBecomeLeader(jobName);
  }

  private async tryBecomeLeader(jobName: string): Promise<void> {
    const leaderKey = `leader:${jobName}`;
    const redis = this.redisClient;

    try {
      const result = await redis.set(
        leaderKey,
        this.instanceId,
        'EX',
        this.leaderTTL,
        'NX',
      );

      if (result === 'OK' && !this.leaderStatus.get(jobName)) {
        this.leaderStatus.set(jobName, true);
        this.logger.log(
          `Instance ${this.instanceId} became leader for ${jobName}`,
        );
      } else if (this.leaderStatus.get(jobName)) {
        const currentLeader = await redis.get(leaderKey);
        if (currentLeader === this.instanceId) {
          await redis.expire(leaderKey, this.leaderTTL);
        } else {
          this.leaderStatus.set(jobName, false);
          this.logger.warn(
            `Instance ${this.instanceId} lost leadership for ${jobName}`,
          );
        }
      }
    } catch (error: any) {
      this.logger.error(
        `Leader election error for ${jobName}: ${error.message}`,
      );
      this.leaderStatus.set(jobName, false);
    }
  }

  public async isLeader(jobName: string): Promise<boolean> {
    return this.leaderStatus.get(jobName) || false;
  }

  public onApplicationShutdown(): void {
    for (const interval of this.electionIntervals.values()) {
      clearInterval(interval);
    }
    this.electionIntervals.clear();
    this.leaderStatus.clear();
  }
}

