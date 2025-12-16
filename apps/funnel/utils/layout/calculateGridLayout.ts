/**
 * Calculates optimal grid layout based on number of items
 * Ensures items remain square (aspect-square)
 * 
 * @param itemCount - Number of items to display
 * @returns Object with columns and rows configuration
 */
export function calculateGridLayout(itemCount: number): { columns: number; rows: number } {
    if (itemCount <= 0) {
        return { columns: 1, rows: 1 };
    }

    if (itemCount === 1) {
        return { columns: 1, rows: 1 };
    }

    if (itemCount === 2) {
        return { columns: 2, rows: 1 };
    }

    if (itemCount === 3) {
        return { columns: 3, rows: 1 };
    }

    if (itemCount === 4) {
        return { columns: 2, rows: 2 };
    }

    if (itemCount === 5) {
        return { columns: 3, rows: 2 }; // 3 in first row, 2 in second
    }

    if (itemCount === 6) {
        return { columns: 3, rows: 2 };
    }

    if (itemCount === 7) {
        return { columns: 3, rows: 3 }; // 3 in first row, 3 in second, 1 in third
    }

    if (itemCount === 8) {
        return { columns: 4, rows: 2 };
    }

    if (itemCount === 9) {
        return { columns: 3, rows: 3 };
    }

    if (itemCount === 10) {
        return { columns: 4, rows: 3 }; // 4 in first two rows, 2 in third
    }

    if (itemCount === 11) {
        return { columns: 4, rows: 3 }; // 4 in first two rows, 3 in third
    }

    if (itemCount === 12) {
        return { columns: 4, rows: 3 };
    }

    // For larger numbers, use a balanced approach
    // Calculate approximate square root and round to nearest column count
    const sqrt = Math.sqrt(itemCount);
    let columns = Math.ceil(sqrt);
    
    // Prefer columns that divide nicely (2, 3, 4)
    if (columns > 4) {
        // Try to find a good divisor
        if (itemCount % 4 === 0) {
            columns = 4;
        } else if (itemCount % 3 === 0) {
            columns = 3;
        } else if (itemCount % 2 === 0) {
            columns = Math.max(2, Math.ceil(itemCount / Math.ceil(itemCount / 4)));
        }
    }

    const rows = Math.ceil(itemCount / columns);
    
    return { columns, rows };
}

/**
 * Gets Tailwind CSS grid columns class based on column count
 */
export function getGridColumnsClass(columns: number): string {
    const gridColsMap: Record<number, string> = {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
        5: "grid-cols-5",
        6: "grid-cols-6",
    };

    return gridColsMap[columns] || `grid-cols-${columns}`;
}



