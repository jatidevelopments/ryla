export const getImageFallback = (content: string) => {
    return content
        .split(" ")
        .map((text) => text[0])
        .join("");
};
