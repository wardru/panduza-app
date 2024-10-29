import "../styles/globals.css";
import lato from "../styles/fonts";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={lato.className}>
        <header></header>
        <main>{children}</main>
        <footer></footer>
      </body>
    </html>
  );
}
