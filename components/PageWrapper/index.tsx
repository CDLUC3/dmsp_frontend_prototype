import React, { useEffect, ReactNode } from 'react';
interface PageWrapperProps {
    title: string;
    children: ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ title, children }) => {
    useEffect(() => {
        document.title = `${title} | DMPTool`;
        window.scrollTo(0, 0);
    }, [title]);
    return (
        <>
            {children}
        </>
    )
}

export default PageWrapper;