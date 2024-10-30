import "../styles/globals.css";
import lato from "../styles/fonts";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="theme-dark">
      <body className={`${lato.className}`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
