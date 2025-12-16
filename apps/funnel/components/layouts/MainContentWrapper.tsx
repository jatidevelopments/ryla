import React from "react";

interface Props {
    children: React.ReactNode;
}

const MainContentWrapper = ({ children }: Props) => (
    <main className="w-full flex-1 flex flex-col bg-black-2 relative overflow-hidden">
        {children}
    </main>
);

export default MainContentWrapper;
