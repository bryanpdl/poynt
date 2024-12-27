import './globals.css';
import { Gabarito } from 'next/font/google';
import { UserProvider } from './contexts/UserContext';

const gabarito = Gabarito({
  subsets: ['latin'],
});

export const metadata = {
  title: 'Poynt',
  description: 'A fast-paced direction-based game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${gabarito.className} antialiased`}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
