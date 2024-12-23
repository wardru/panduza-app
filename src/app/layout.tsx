import '../styles/globals.css';
import lato from '../styles/fonts';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang='en'
            className='theme-dark disable-select'
        >
            <body className={`${lato.className}`}>
                <main>{children}</main>
            </body>
        </html>
    );
}
