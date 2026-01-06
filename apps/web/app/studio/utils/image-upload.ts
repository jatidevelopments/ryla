import type { StudioImage } from '../../../components/studio/studio-image-card';

/**
 * Convert a File to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert upload result to StudioImage format
 */
export function uploadResultToStudioImage(result: {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  name?: string | null;
  createdAt: string;
}): StudioImage {
  return {
    id: result.id,
    imageUrl: result.imageUrl,
    thumbnailUrl: result.thumbnailUrl || undefined,
    influencerId: '', // Not applicable for user uploads
    influencerName: result.name || 'Uploaded Image',
    prompt: result.name || 'Uploaded Image',
    aspectRatio: '1:1', // Default, could be detected
    status: 'completed',
    createdAt: result.createdAt,
    nsfw: false, // Uploaded images are SFW by default
  };
}

