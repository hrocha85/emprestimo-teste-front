import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Empresa X",
  description: "Bem vindo",
};

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <html lang="en">
    <body className={inter.className}>
      <Header />
      <main>{children}</main>
    </body>
  </html>
);

export default RootLayout;
