"use client";

import { Link } from "../../src/i18n/navigation";

export interface AppMainNavItem {
  href: string;
  label: string;
  isActive?: boolean;
}

export interface AppMainNavProps {
  items: AppMainNavItem[];
  ariaLabel?: string;
}

export function AppMainNav({ items, ariaLabel }: AppMainNavProps) {
  return (
    <nav aria-label={ariaLabel}>
      <ul className="navList">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
