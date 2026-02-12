import Link from "next/link";

export function PrimaryNav() {
  return (
    <nav aria-label="Primary">
      <ul className="navList">
        <li>
          <Link href="/">Dashboard</Link>
        </li>
        <li>
          <Link href="/recipes">Recipes</Link>
        </li>
      </ul>
    </nav>
  );
}

