import React from 'react';

interface LayoutProps {
    sidebar: React.ReactNode;
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ sidebar, children }) => {
    return (
        <div className="flex min-h-screen">
            {sidebar}
            <main className="flex-1 p-4 overflow-x-hidden">
                <div className="glass-panel min-h-full p-6 relative">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
