import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkipAuth } from '../auth/decorators/skip-auth.decorator';
import { Inject } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';
import { FunnelSessionService } from '@ryla/business/services/funnel-session.service';
import { FunnelOptionService } from '@ryla/business/services/funnel-option.service';

@ApiTags('Funnel')
@Controller('funnel')
@SkipAuth() // Anonymous sessions - no auth required
export class FunnelController {
  private sessionService: FunnelSessionService;
  private optionService: FunnelOptionService;

  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {
    this.sessionService = new FunnelSessionService(this.db);
    this.optionService = new FunnelOptionService(this.db);
  }

  @Post('sessions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a new funnel session' })
  @ApiResponse({ status: 200, description: 'Session created or retrieved' })
  async createSession(
    @Body() body: { sessionId?: string; session_id?: string; currentStep?: number; current_step?: number },
  ) {
    // Handle both camelCase and snake_case for backward compatibility
    const sessionId = body.sessionId || body.session_id;
    const currentStep = body.currentStep ?? body.current_step;
    
    if (!sessionId) {
      throw new Error('sessionId is required');
    }

    const session = await this.sessionService.createSession({
      sessionId,
      currentStep,
    });
    if (!session) return null;
    // Transform to match frontend types (snake_case)
    return {
      id: session.id,
      session_id: session.sessionId,
      email: session.email,
      on_waitlist: session.onWaitlist,
      current_step: session.currentStep,
      created_at: session.createdAt.toISOString(),
      updated_at: session.updatedAt.toISOString(),
    };
  }

  @Put('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update funnel session' })
  @ApiResponse({ status: 200, description: 'Session updated' })
  async updateSession(
    @Param('sessionId') sessionId: string,
    @Body() body: { 
      email?: string | null; 
      onWaitlist?: boolean; 
      on_waitlist?: boolean;
      currentStep?: number | null;
      current_step?: number | null;
    },
  ) {
    // Handle both camelCase and snake_case for backward compatibility
    const updateData: {
      email?: string | null;
      onWaitlist?: boolean;
      currentStep?: number | null;
    } = {};
    
    if (body.email !== undefined) updateData.email = body.email;
    if (body.onWaitlist !== undefined) updateData.onWaitlist = body.onWaitlist;
    if (body.on_waitlist !== undefined) updateData.onWaitlist = body.on_waitlist;
    if (body.currentStep !== undefined) updateData.currentStep = body.currentStep;
    if (body.current_step !== undefined) updateData.currentStep = body.current_step;

    const session = await this.sessionService.updateSession(sessionId, updateData);
    if (!session) return null;
    // Transform to match frontend types (snake_case)
    return {
      id: session.id,
      session_id: session.sessionId,
      email: session.email,
      on_waitlist: session.onWaitlist,
      current_step: session.currentStep,
      created_at: session.createdAt.toISOString(),
      updated_at: session.updatedAt.toISOString(),
    };
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get funnel session by ID' })
  @ApiResponse({ status: 200, description: 'Session found' })
  async getSession(@Param('sessionId') sessionId: string) {
    const session = await this.sessionService.getSession(sessionId);
    if (!session) return null;
    // Transform to match frontend types (snake_case)
    return {
      id: session.id,
      session_id: session.sessionId,
      email: session.email,
      on_waitlist: session.onWaitlist,
      current_step: session.currentStep,
      created_at: session.createdAt.toISOString(),
      updated_at: session.updatedAt.toISOString(),
    };
  }

  @Post('sessions/:sessionId/options')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save a single option for a session' })
  @ApiResponse({ status: 200, description: 'Option saved' })
  async saveOption(
    @Param('sessionId') sessionId: string,
    @Body() body: { optionKey?: string; option_key?: string; optionValue?: any; option_value?: any },
  ) {
    // Handle both camelCase and snake_case for backward compatibility
    const optionKey = body.optionKey || body.option_key;
    const optionValue = body.optionValue ?? body.option_value;
    
    if (!optionKey) {
      throw new Error('optionKey is required');
    }

    const success = await this.optionService.saveOption(
      sessionId,
      optionKey,
      optionValue,
    );
    return { success };
  }

  @Post('sessions/:sessionId/options/batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save multiple options for a session' })
  @ApiResponse({ status: 200, description: 'Options saved' })
  async saveAllOptions(
    @Param('sessionId') sessionId: string,
    @Body() body: { options: Record<string, any> },
  ) {
    const success = await this.optionService.saveAllOptions(
      sessionId,
      body.options,
    );
    return { success };
  }

  @Get('sessions/:sessionId/options')
  @ApiOperation({ summary: 'Get all options for a session' })
  @ApiResponse({ status: 200, description: 'Options retrieved' })
  async getSessionOptions(@Param('sessionId') sessionId: string) {
    const options = await this.optionService.getSessionOptions(sessionId);
    // Transform to match frontend types (snake_case)
    return options.map((option) => ({
      id: option.id,
      session_id: option.sessionId,
      option_key: option.optionKey,
      option_value: option.optionValue,
      created_at: option.createdAt.toISOString(),
      updated_at: option.updatedAt.toISOString(),
    }));
  }
}
