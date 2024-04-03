import Image from 'next/image';
import DMPLogo from '@/public/images/DMP-logo.svg';
import './contributor-roles.scss';

export default function ContributorRolesLayout({children}) {
    return (
        <div className="wrapper">
            <header>
                <div className="dmpui-frontend-container dmpui-frontend dmpui-frontend-header">
                    <div className="header-logo dmpui-grow">
                        <a href="/">
                        <Image src={DMPLogo } alt="DMP Tool" />
                        </a>
                    </div>
                </div>
            </header>
            {children}
        </div>
    )
}