"use client";

import { useEffect, useRef } from "react";

interface StructuredDataProps {
    data: object;
    id?: string;
}

/**
 * Component to inject JSON-LD structured data for SEO and AI search engines
 * This helps ChatGPT and other AI crawlers understand the page content
 */
export function StructuredData({ data, id }: StructuredDataProps) {
    const scriptIdRef = useRef(`structured-data-${id || Math.random().toString(36).substring(7)}`);

    useEffect(() => {
        // Remove any existing structured data script with this ID
        const existingScript = document.getElementById(scriptIdRef.current);
        if (existingScript) {
            existingScript.remove();
        }

        // Create and inject new structured data
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.text = JSON.stringify(data);
        script.id = scriptIdRef.current;
        document.head.appendChild(script);

        return () => {
            const scriptToRemove = document.getElementById(scriptIdRef.current);
            if (scriptToRemove) {
                scriptToRemove.remove();
            }
        };
    }, [data]);

    return null;
}

