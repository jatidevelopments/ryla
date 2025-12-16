"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUtmStore } from "@/store/states/utm";

export function useInitUtm() {
    const searchParams = useSearchParams();
    const merge = useUtmStore((state) => state.merge);

    useEffect(() => {
        if (!searchParams) return;

        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        if (Object.keys(params).length > 0) merge(params);
    }, [searchParams, merge]);
}
