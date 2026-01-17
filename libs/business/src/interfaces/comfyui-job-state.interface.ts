/**
 * ComfyUI Job State Interface
 *
 * TypeScript interface for job state stored in Redis.
 *
 * @see EP-040: Redis Job Persistence and Recovery
 */

export interface JobState {
  promptId: string;
  type: 'image_generation' | 'lora_training' | 'face_swap' | 'character_sheet';
  userId: string;
  characterId?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;  // 0-100
  startedAt: number;  // timestamp
  clientId?: string;  // WebSocket client ID (if EP-039 implemented)
  serverUrl: string;  // ComfyUI server URL
}
