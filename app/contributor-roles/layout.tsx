import './contributor-roles.scss';

export default function ContributorRolesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="wrapper">
            {/* <header>
                <div className="dmpui-frontend-container dmpui-frontend dmpui-frontend-header">
                    <div className="header-logo dmpui-grow">
                        <a href="/">
                        <Image src={DMPLogo } alt="DMP Tool" />
                        </a>
                    </div>
                </div>
            </header> */}
            <div id="App">
                {children}
            </div>
        </div>
    )
}