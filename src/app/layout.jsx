import Providers from "@/components/Providers";
import "./globals.css"; // keep this if you already have it

export const metadata = {
  title: "Touch-n-Call",
  description: "Show Call Scheduler",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}