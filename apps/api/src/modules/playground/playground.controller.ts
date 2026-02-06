import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipAuth } from '../auth/decorators/skip-auth.decorator';
import { PlaygroundService } from './playground.service';
import {
  RunComfyPlaygroundService,
  type RunComfyDeployment,
} from './runcomfy-playground.service';

@ApiTags('Playground')
@Controller('playground')
@SkipAuth()
export class PlaygroundController {
  constructor(
    @Inject(PlaygroundService) private readonly playgroundService: PlaygroundService,
    @Inject(RunComfyPlaygroundService) private readonly runcomfyService: RunComfyPlaygroundService
  ) { }

  @Post('modal/call')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Call a Modal endpoint (playground only, no auth)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['endpoint', 'body'],
      properties: {
        endpoint: { type: 'string', example: '/flux' },
        body: { type: 'object', description: 'JSON body for the Modal endpoint' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Image + metadata or error' })
  async callModal(
    @Body() dto: { endpoint: string; body: Record<string, unknown> }
  ) {
    const { endpoint, body } = dto;
    if (!endpoint || typeof endpoint !== 'string') {
      return { error: 'endpoint is required' };
    }
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return this.playgroundService.callEndpoint(path, body ?? {});
  }

  @Get('runcomfy/endpoints')
  @ApiOperation({ summary: 'List RunComfy deployments (playground only)' })
  @ApiResponse({ status: 200, description: 'List of deployments or error' })
  async listRunComfyEndpoints(): Promise<
    RunComfyDeployment[] | { error: string }
  > {
    return this.runcomfyService.listDeployments();
  }

  @Post('runcomfy/call')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Call a RunComfy deployment (playground only)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['deployment_id'],
      properties: {
        deployment_id: { type: 'string', description: 'RunComfy deployment UUID' },
        prompt: { type: 'string' },
        seed: { type: 'number' },
        overrides: {
          type: 'object',
          description: 'Optional node overrides (node_id -> { inputs })',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Image base64 + metadata or error' })
  async callRunComfy(
    @Body()
    dto: {
      deployment_id: string;
      prompt?: string;
      seed?: number;
      overrides?: Record<string, { inputs: Record<string, unknown> }>;
    }
  ) {
    const { deployment_id, prompt, seed, overrides } = dto;
    if (!deployment_id || typeof deployment_id !== 'string') {
      return { error: 'deployment_id is required' };
    }
    return this.runcomfyService.callDeployment(deployment_id, {
      prompt,
      seed,
      overrides,
    });
  }
}
