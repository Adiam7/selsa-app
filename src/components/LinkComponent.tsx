// components/LinkComponent.tsx
import Link from 'next/link';
import { ReactNode } from 'react';

interface LinkComponentProps {
  href: string;
  children: ReactNode;
  className?: string;
  role?: string;
}

const LinkComponent = ({ href, children, className, role }: LinkComponentProps) => {
  return (
    <Link href={href} className={className} role={role}>
      {children}
    </Link>
  );
};

export default LinkComponent;
