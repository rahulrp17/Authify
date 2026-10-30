import { Link } from 'react-router-dom';
import { ArrowUpRight, LockKeyhole } from 'lucide-react';
import { Logo } from '../common/Logo';
import { Badge } from '../common/Badge';
import { Marquee } from '../marketing/Marquee';

const columns = [
  {
    title: 'Account',
    links: [
      { label: 'Create account', to: '/register' },
      { label: 'Log in', to: '/login' },
      { label: 'Reset password', to: '/forgot-password' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'Security model', to: '/#security' },
      { label: 'How it works', to: '/#how-it-works' },
      { label: 'FAQ', to: '/#faq' },
    ],
  },
  {
    title: 'Access',
    links: [
      { label: 'Identity console', to: '/dashboard' },
      { label: 'Session control', to: '/dashboard/sessions' },
      { label: 'Profile settings', to: '/dashboard/profile' },
    ],
  },
];

const footerTicker = [
  'Your identity. Your rules.',
  'Verified by design',
  'Revocable by default',
  'Zero shortcuts',
];

const WordmarkMarquee = () => (
  <div className="flex overflow-hidden py-4" aria-hidden="true">
    <div className="marquee-track flex w-max items-center">
      {[0, 1].map((group) => (
        <div key={group} className="flex shrink-0 items-center">
          {[0, 1, 2].map((index) => (
            <span key={index} className="flex items-center gap-6 px-6">
              <span className="font-display text-[clamp(4.5rem,13vw,11rem)] font-bold uppercase leading-[0.72] tracking-[-0.1em] text-line">
                AUTHIFY
              </span>
              <span className="font-display text-[clamp(1.5rem,4vw,3rem)] text-acid">
                ✦
              </span>
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const Footer = () => (
  <footer className="border-t-2 border-line bg-surface">
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-6 max-w-xs text-sm leading-6 text-muted">
            A complete authentication layer for products that take identity
            seriously. Built with MongoDB, Express, React, and Node.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="acid" dot>
              Systems nominal
            </Badge>
            <Badge variant="neutral">v1.0</Badge>
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.24em] text-white">
              {column.title}
            </h3>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-acid"
                  >
                    {link.label}
                    <ArrowUpRight
                      className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <div className="border-y-2 border-line bg-void">
      <WordmarkMarquee />
      <div className="border-t-2 border-line bg-surface">
        <Marquee
          items={footerTicker}
          reverse
          separator="✦"
          className="py-2 text-[9px] text-muted"
        />
      </div>
    </div>

    <div className="border-t-2 border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
          © {new Date().getFullYear()} AUTHIFY. All rights reserved.
        </p>
        <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted">
          <LockKeyhole className="h-3.5 w-3.5 text-acid" aria-hidden="true" />
          Secure by default. No shortcuts.
        </p>
      </div>
    </div>
  </footer>
);
