declare module "@/constants/brandsSprite.generated" {
    export type SpriteBrand = {
        id: string;
        title: string;
        w: number;
        h: number;
        x: number;
        y: number;
    };
    export const SPRITE_URL: string;
    export const SPRITE_W: number;
    export const SPRITE_H: number;
    export const SPRITE_ITEMS: SpriteBrand[];
}
