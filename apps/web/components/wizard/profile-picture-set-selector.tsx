'use client';

import * as React from 'react';
import { profilePictureSets } from '@ryla/business';
import { ProfilePictureSetSelectorHeader } from './profile-picture-set-selector/header';
import { SkipOption } from './profile-picture-set-selector/skip-option';
import { ProfileSetCard } from './profile-picture-set-selector/profile-set-card';
import { InfoNote } from './profile-picture-set-selector/info-note';

interface ProfilePictureSetSelectorProps {
  selectedSetId: string | null;
  onSelect: (setId: string | null) => void;
  creditCost: number;
}

export function ProfilePictureSetSelector({
  selectedSetId,
  onSelect,
  creditCost,
}: ProfilePictureSetSelectorProps) {
  const [hoveredSet, setHoveredSet] = React.useState<string | null>(null);

  return (
    <div className="w-full">
      <ProfilePictureSetSelectorHeader />

      <SkipOption
        isSelected={selectedSetId === null}
        onSelect={() => onSelect(null)}
      />

      {/* Set Options */}
      <div className="space-y-3">
        {profilePictureSets.map((set) => {
          const isSelected = selectedSetId === set.id;
          const isHovered = hoveredSet === set.id;

          return (
            <ProfileSetCard
              key={set.id}
              set={set}
              isSelected={isSelected}
              isHovered={isHovered}
              creditCost={creditCost}
              onSelect={() => onSelect(set.id)}
              onMouseEnter={() => setHoveredSet(set.id)}
              onMouseLeave={() => setHoveredSet(null)}
            />
          );
        })}
      </div>

      <InfoNote />
    </div>
  );
}

