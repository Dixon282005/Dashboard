import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata = {
  title: "Dashboard",
  description: "Mini-dashboard en tiempo real de criptomonedas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <Sidebar />
        <main className="p-4 sm:ml-64 mt-14">{children}</main>
      </body>
    </html>
  );
}
