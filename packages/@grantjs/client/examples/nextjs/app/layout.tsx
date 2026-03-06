import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from './providers';
import { ThemeToggle } from './theme-toggle';

export const metadata: Metadata = {
  title: 'Grant Client Next.js Example',
  description: 'Minimal Next.js app with @grantjs/client React hooks and GrantGate',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}else if(window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.setAttribute('data-theme','dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <AppProviders>
          <ThemeToggle />
          <div className="main-container">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
