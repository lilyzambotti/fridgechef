import "./globals.css";
import { APP_NAME, FOUNDER_NAME } from "@/lib/config";

export const metadata = {
  title: `${APP_NAME} | Turn what's in your fridge into dinner`,
  description: `${APP_NAME} uses AI to turn the ingredients you already have into 3 recipes you can cook tonight. Created by ${FOUNDER_NAME}.`,
  authors: [{ name: FOUNDER_NAME }],
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
