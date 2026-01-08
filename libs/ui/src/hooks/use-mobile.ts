'use client';

import * as React from 'react';

export function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);

        // Initial check
        checkMobile();

        // Add listener
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, [breakpoint]);

    return isMobile;
}
