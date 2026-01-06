'use client';

import Image from 'next/image';

interface BaseImagePreviewProps {
  imageUrl: string;
}

export function BaseImagePreview({ imageUrl }: BaseImagePreviewProps) {
  return (
    <div className="w-full mb-6">
      <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
        <p className="text-white/70 text-sm mb-3">Selected Base Image</p>
        <div className="relative aspect-square max-w-xs mx-auto rounded-xl overflow-hidden">
          <Image src={imageUrl} alt="Selected base image" fill className="object-cover" />
        </div>
      </div>
    </div>
  );
}

