export function getRandomFromRange(rangeStr: string): number {
    const [minStr, maxStr] = rangeStr.split("-");
    const min = Number(minStr);
    const max = Number(maxStr);

    if (isNaN(min) || isNaN(max) || min > max) {
        throw new Error("Invalid range format");
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
}
