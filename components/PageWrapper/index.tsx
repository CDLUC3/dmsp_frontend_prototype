import React, { useEffect, ReactNode } from 'react';
import BackButton from "@/components/BackButton";
interface PageWrapperProps {
    title: string;
    backButton: boolean;
    children: ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ title, backButton, children }) => {
    useEffect(() => {
        document.title = `${title} | DMPTool`;
        window.scrollTo(0, 0);
    }, [title]);
    return (
        <>
            <BackButton />
            {children}
        </>
    )
}

export default PageWrapper;