'use client';

import clsx from 'clsx';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

export default function Header() {
  return (
    <>
      <header className="flex items-center justify-end px-6 py-4">
        <ThemeToggle />
      </header>
      <h1
        className={clsx(
          'duration-500',
          'text-6xl',
          'font-bold',
          'text-blue-500',
          'transition-all',
          'hover:bg-blue-500',
          'hover:text-white',
        )}
      >
        Header
      </h1>
    </>
  );
}
