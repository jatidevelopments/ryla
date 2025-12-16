type AvatarItem = {
    src: string;
    w: number;
    h: number;
    posClass: string;
    imageClass?: string;
};

export const AVATARS_HAPPY_USERS: AvatarItem[] = [
    {
        src: "/images/avatars/avatar_1.webp",
        w: 55,
        h: 55,
        posClass: "top-[65%] left-[20%]",
        imageClass: "rounded-full rotate-7",
    },
    {
        src: "/images/avatars/avatar_2.webp",
        w: 57,
        h: 57,
        posClass: "top-[28%] left-[55%]",
        imageClass: "rounded-full",
    },
    {
        src: "/images/avatars/avatar_3.webp",
        w: 55,
        h: 55,
        posClass: "top-[65%] left-[60%]",
        imageClass: "rounded-full",
    },
    {
        src: "/images/avatars/avatar_4.webp",
        w: 37,
        h: 37,
        posClass: "top-[50%] left-[70%]",
        imageClass: "rounded-full",
    },
    {
        src: "/images/avatars/avatar_5.webp",
        w: 65,
        h: 65,
        posClass: "top-[35%] left-[20%]",
        imageClass: "rounded-full",
    },
];
