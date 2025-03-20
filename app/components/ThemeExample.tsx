'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function ThemeExample() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Button onClick={toggleTheme} variant="outline">
          Toggle theme
        </Button>
        <Button variant="default">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="destructive">Destructive Button</Button>
      </div>
    </div>
  );
}
