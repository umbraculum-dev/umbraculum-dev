import Link from "next/link";

export default function RecipesPage() {
  return (
    <>
      <h1 style={{ marginBottom: 8 }}>Recipes</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        This is the recipe area entrypoint (list/edit/water calculator).
      </p>

      <p>
        For now, create recipes from the Dashboard dev panel and then navigate to edit/water pages
        once they exist.
      </p>

      <ul>
        <li>
          <Link href="/">Back to Dashboard</Link>
        </li>
      </ul>
    </>
  );
}

