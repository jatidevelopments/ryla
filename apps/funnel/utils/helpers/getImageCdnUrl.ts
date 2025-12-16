const CDN_URL = process.env.NEXT_PUBLIC_IMAGE_CDN_URL || "";

export const getImageCdnUrl = (imageUrl: string) => {
    return CDN_URL + "/" + imageUrl;
};
