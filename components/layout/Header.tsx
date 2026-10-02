'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { EchoLogo } from '@/components/ui/EchoLogo';
import { WalletButton } from '@/components/wallet/WalletButton';
import { useScrollY } from '@/hooks/useCountUp';
import { NAV_ITEMS } from '@/lib/navigation';
import { cn } from '@/lib/format';

export function Header() {
  const pathname = usePathname();
  const scrolled = useScrollY(24);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="fixed inset-x-0 top-0 z-[100]">
      <div
        className={cn(
          'relative transition-all duration-500 ease-echo',
          scrolled ? 'border-b border-white/[0.07] bg-void-900/78 backdrop-blur-xl' : 'border-b border-transparent',
        )}
      >
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 transition-opacity duration-500',
            scrolled ? 'opacity-0' : 'opacity-100',
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-void-900/90 via-void-900/40 to-transparent" />
        </div>

        <div className="shell relative flex h-[62px] items-center justify-between gap-4 md:h-[68px]">
          <Link href="/" className="group flex shrink-0 items-center" aria-label="ECHO AI² home">
            <EchoLogo className="transition-opacity duration-300 group-hover:opacity-85" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-3.5 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] transition-colors duration-300',
                    active ? 'text-white' : 'text-echo-faint hover:text-echo-muted',
                  )}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-2.5 -bottom-px h-px bg-gradient-to-r from-transparent via-[#8FA9FF] to-transparent"
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <WalletButton size="sm" className="hidden sm:inline-flex" />
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-white/10 text-echo-muted transition-colors hover:border-white/25 hover:text-white lg:hidden"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-white/[0.07] bg-void-900/96 backdrop-blur-xl lg:hidden"
            >
              <nav className="shell flex flex-col py-3" aria-label="Mobile">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center justify-between border-b border-white/[0.05] py-3.5 text-[0.76rem] font-semibold uppercase tracking-[0.2em] last:border-0',
                      isActive(item.href) ? 'text-white' : 'text-echo-faint',
                    )}
                  >
                    {item.label}
                    <span className="text-echo-faint/60">→</span>
                  </Link>
                ))}
                <div className="pt-4">
                  <WalletButton size="md" className="w-full" />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
