'use client';


function Footer() {
    const year = new Date().getFullYear();

    return (
        <>
            <footer style={{ borderTop: '1px solid blue' }}>
                &copy; {year} The Regents of the University of California

            </footer>
        </>
    );
}

export default Footer;
