import Link from "next/link";
import { DevAuthStatus } from "./DevAuthStatus";

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
        <li style={{ marginLeft: "auto" }}>
          <DevAuthStatus />
        </li>
      </ul>
    </nav>
  );
}

