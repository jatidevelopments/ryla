import { BadRequestException, Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

import * as schema from '@ryla/data/schema';
import { GenerationJobsRepository, ImagesRepository } from '@ryla/data';
import { buildFluxInpaintWorkflow } from '@ryla/business';

import { ComfyUIJobRunnerAdapter } from './comfyui-job-runner.adapter';
import { ImageStorageService } from './image-storage.service';

function parseBase64DataUrl(dataUrl: string): Buffer {
  if (!dataUrl) throw new Error('Missing base64 image');

  if (!dataUrl.startsWith('data:')) {
    // Raw base64
    return Buffer.from(dataUrl, 'base64');
  }

  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid base64 data URL format');
  }
  return Buffer.from(matches[2], 'base64');
}

@Injectable()
export class InpaintEditService {
  private readonly generationJobsRepo: GenerationJobsRepository;
  private readonly imagesRepo: ImagesRepository;

  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
    @Inject(ComfyUIJobRunnerAdapter)
    private readonly comfyui: ComfyUIJobRunnerAdapter,
    @Inject(ImageStorageService)
    private readonly imageStorage: ImageStorageService,
  ) {
    this.generationJobsRepo = new GenerationJobsRepository(this.db);
    this.imagesRepo = new ImagesRepository(this.db);
  }

  async startInpaintEdit(input: {
    userId: string;
    characterId: string;
    sourceImageId: string;
    prompt: string;
    negativePrompt?: string;
    maskedImageBase64Png: string;
    seed?: number;
  }) {
    // Verify character ownership
    const character = await this.db.query.characters.findFirst({
      where: and(eq(schema.characters.id, input.characterId), eq(schema.characters.userId, input.userId)),
    });
    if (!character) throw new NotFoundException('Character not found');

    // Verify source image ownership and that it belongs to the character
    const sourceImage = await this.imagesRepo.getById({ id: input.sourceImageId, userId: input.userId });
    if (!sourceImage) throw new NotFoundException('Source image not found');
    if (sourceImage.characterId !== input.characterId) {
      throw new BadRequestException('Source image does not belong to this character');
    }

    // Require structured metadata (per EP-005)
    if (!sourceImage.scene || !sourceImage.environment || !sourceImage.outfit || !sourceImage.aspectRatio || !sourceImage.qualityMode) {
      throw new BadRequestException('Source image is missing required Studio metadata');
    }

    // Upload masked RGBA PNG to ComfyUI input folder
    const buffer = parseBase64DataUrl(input.maskedImageBase64Png);
    const filename = `ryla_inpaint_${randomUUID()}.png`;
    const uploadedFilename = await this.comfyui.uploadImage(buffer, filename);

    // Queue inpaint workflow
    const workflow = buildFluxInpaintWorkflow({
      prompt: input.prompt,
      negativePrompt: input.negativePrompt,
      imageFilename: uploadedFilename,
      seed: input.seed,
    });

    const promptId = await this.comfyui.queueWorkflow(workflow);

    // Optional (nice-to-have): persist the edit mask (or masked RGBA image) for debugging/replay
    // We store the same RGBA PNG sent to ComfyUI, keyed under the promptId for traceability.
    let editMaskS3Key: string | undefined;
    try {
      const { images } = await this.imageStorage.uploadImages([input.maskedImageBase64Png], {
        userId: input.userId,
        category: 'inpaint-masks',
        jobId: promptId,
        characterId: input.characterId,
      });
      editMaskS3Key = images[0]?.key;
    } catch {
      // Non-blocking for MVP
      editMaskS3Key = undefined;
    }

    // Track in DB as a generation job (so /image/jobs/:jobId works)
    const job = await this.generationJobsRepo.createJob({
      userId: input.userId,
      characterId: input.characterId,
      type: 'image_generation',
      status: 'queued',
      input: {
        scene: sourceImage.scene,
        environment: sourceImage.environment,
        outfit: sourceImage.outfit,
        aspectRatio: sourceImage.aspectRatio,
        qualityMode: sourceImage.qualityMode,
        nsfw: sourceImage.nsfw ?? false,
        prompt: input.prompt,
        negativePrompt: input.negativePrompt,
        seed: input.seed?.toString(),
        sourceImageId: input.sourceImageId,
        editType: 'inpaint',
        editMaskS3Key,
      },
      imageCount: 1,
      completedCount: 0,
      externalJobId: promptId,
      externalProvider: 'comfyui',
      startedAt: new Date(),
    });

    return { jobId: job.id, promptId };
  }
}


