/**
 * Primary navigation.
 *
 * Deliberately kept in a plain module (no `'use client'`): both the client
 * `Header` and the server-rendered `Footer` consume it, and importing a value
 * out of a client module into a server component would turn it into an
 * unusable client reference.
 */
export interface NavItem {
  href: string;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/my-echo', label: 'My Echo' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/world', label: 'World' },
  { href: '/battle', label: 'Battle' },
];
