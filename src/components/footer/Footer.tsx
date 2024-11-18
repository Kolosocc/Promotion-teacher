import React, { FC } from 'react';
import Image from 'next/image';

const Footer: FC = () => (
  <footer className="flex gap-6 p-4 bg-gray-800 text-white items-center justify-center">
    <a
      href="https://nextjs.org/learn"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 hover:underline"
    >
      <Image src="/file.svg" alt="File icon" width={16} height={16} aria-hidden />
      Learn
    </a>
    <a
      href="https://vercel.com/templates"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 hover:underline"
    >
      <Image src="/window.svg" alt="Window icon" width={16} height={16} aria-hidden />
      Examples
    </a>
    <a
      href="https://nextjs.org"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 hover:underline"
    >
      <Image src="/globe.svg" alt="Globe icon" width={16} height={16} aria-hidden />
      Go to nextjs.org →
    </a>
  </footer>
);

export default Footer;
