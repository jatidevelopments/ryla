'use client';

import * as React from 'react';

/**
 * Hook for managing delete confirmation state
 */
export function useDeleteConfirmation() {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  return {
    showDeleteConfirm,
    setShowDeleteConfirm,
    confirmDelete: () => setShowDeleteConfirm(true),
    cancelDelete: () => setShowDeleteConfirm(false),
  };
}

