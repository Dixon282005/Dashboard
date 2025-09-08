import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata = {
  title: "Dashboard",
  description: "Mini-dashboard en tiempo real de criptomonedas"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Sidebar/>
        {children}
      </body>
    </html>
  );
}
