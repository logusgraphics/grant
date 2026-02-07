export const metadata = {
  title: 'Grant Next.js Example',
  description: 'Minimal Next.js API routes with @grantjs/server',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
