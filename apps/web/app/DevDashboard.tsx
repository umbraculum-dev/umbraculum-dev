"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { apiFetch } from "./_lib/apiClient";
import { loadDevAuthFromStorage, saveDevAuthToStorage, type DevAuth } from "./_lib/devAuth";

type AccountListItem = { id: string; name: string; role: string };
type RecipeListItem = { id: string; accountId: string; name: string; style: string | null };

export function DevDashboard() {
  const [auth, setAuth] = useState<DevAuth | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [me, setMe] = useState<unknown>(null);
  const [accounts, setAccounts] = useState<AccountListItem[]>([]);
  const [newAccountName, setNewAccountName] = useState("");
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [newRecipeName, setNewRecipeName] = useState("");
  const [newRecipeStyle, setNewRecipeStyle] = useState("");
  const [recipeFormError, setRecipeFormError] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [duplicateInstance, setDuplicateInstance] = useState(false);

  useEffect(() => {
    setAuth(loadDevAuthFromStorage());
    setAuthLoaded(true);
  }, []);

  // Hardening (dev-only): prevent accidental duplicate mounting (can happen with
  // dev tooling + hydration recovery + browser extensions).
  useEffect(() => {
    const w = window as unknown as { __breweryDevDashboardMounted?: boolean };
    if (w.__breweryDevDashboardMounted) {
      setDuplicateInstance(true);
      return;
    }
    w.__breweryDevDashboardMounted = true;
    return () => {
      w.__breweryDevDashboardMounted = false;
    };
  }, []);

  const canCallUserScoped = useMemo(() => Boolean(auth?.userId), [auth]);
  const canCallAccountScoped = useMemo(
    () => Boolean(auth?.userId && auth?.activeAccountId),
    [auth],
  );

  const refresh = useCallback(async () => {
    if (!auth) return;
    setLastError(null);
    try {
      const meRes = await apiFetch("/api/me", auth);
      setMe(meRes);
      const accRes = await apiFetch("/api/accounts", auth);
      const list = (accRes.ok &&
      typeof accRes.data === "object" &&
      accRes.data !== null &&
      "accounts" in accRes.data
        ? (accRes.data as any).accounts
        : []) as AccountListItem[];
      setAccounts(Array.isArray(list) ? list : []);

      if (auth.activeAccountId) {
        const recipesRes = await apiFetch("/api/recipes", auth);
        const rlist = (recipesRes.ok &&
        typeof recipesRes.data === "object" &&
        recipesRes.data !== null &&
        "recipes" in recipesRes.data
          ? (recipesRes.data as any).recipes
          : []) as RecipeListItem[];
        setRecipes(Array.isArray(rlist) ? rlist : []);
      } else {
        setRecipes([]);
      }
    } catch (err) {
      setLastError(String(err));
    }
  }, [auth]);

  useEffect(() => {
    if (!auth) return;
    void refresh();
  }, [auth, refresh]);

  const onSaveHeaders = () => {
    if (!auth) return;
    saveDevAuthToStorage(auth);
    void refresh();
  };

  const onCreateAccount = async () => {
    if (!auth) return;
    setLastError(null);
    try {
      const res = await apiFetch("/api/accounts", auth, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAccountName }),
      });
      if (!res.ok) {
        setLastError(JSON.stringify(res, null, 2));
        return;
      }
      const createdId =
        typeof res.data === "object" &&
        res.data !== null &&
        "account" in res.data &&
        typeof (res.data as any).account?.id === "string"
          ? ((res.data as any).account.id as string)
          : null;

      if (createdId) {
        setAuth((a) => (a ? { ...a, activeAccountId: createdId } : a));
        saveDevAuthToStorage({ ...auth, activeAccountId: createdId });
      }
      setNewAccountName("");
      await refresh();
    } catch (err) {
      setLastError(String(err));
    }
  };

  const onCreateRecipe = async () => {
    if (!auth) return;
    setRecipeFormError(null);
    setLastError(null);

    const name = newRecipeName.trim();
    if (!name) {
      setRecipeFormError("Recipe name is required.");
      return;
    }
    if (!auth.activeAccountId) {
      setRecipeFormError("Select an active account first.");
      return;
    }

    try {
      const res = await apiFetch("/api/recipes", auth, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          style: newRecipeStyle.trim() || undefined,
        }),
      });
      if (!res.ok) {
        setRecipeFormError("Failed to create recipe.");
        setLastError(JSON.stringify(res, null, 2));
        return;
      }
      setNewRecipeName("");
      setNewRecipeStyle("");
      await refresh();
    } catch (err) {
      setRecipeFormError("Failed to create recipe.");
      setLastError(String(err));
    }
  };

  const onDeleteRecipe = async (r: RecipeListItem) => {
    if (!auth) return;
    if (!auth.activeAccountId) return;
    const ok = window.confirm(`Delete recipe "${r.name}"? This cannot be undone.`);
    if (!ok) return;
    setLastError(null);
    try {
      const res = await apiFetch(`/api/recipes/${r.id}`, auth, { method: "DELETE" });
      if (!res.ok) {
        setLastError(JSON.stringify(res, null, 2));
        return;
      }
      await refresh();
    } catch (err) {
      setLastError(String(err));
    }
  };

  // Keep active account valid: if it doesn't exist, fall back to first.
  useEffect(() => {
    if (!auth) return;
    if (!accounts.length) return;
    const exists = accounts.some((a) => a.id === auth.activeAccountId);
    if (auth.activeAccountId && exists) return;
    const next = accounts[0]?.id ?? "";
    if (!next) return;
    setAuth((a) => (a ? { ...a, activeAccountId: next } : a));
    saveDevAuthToStorage({ ...auth, activeAccountId: next });
  }, [accounts, auth]);

  if (duplicateInstance) return null;

  return (
    <section style={{ marginTop: 24 }}>
      <h2>Dev auth headers (temporary)</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        These headers are for dev-only bootstrapping. See <code>TODOs.md</code> for migration to
        proper auth.
      </p>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label
            htmlFor="dev-user-id"
            className="muted"
            style={{ display: "block", fontSize: 12 }}
          >
            X-User-Id
          </label>
          <input
            id="dev-user-id"
            style={{ width: "100%", padding: 8 }}
            value={auth?.userId ?? ""}
            onChange={(e) => setAuth((a) => (a ? { ...a, userId: e.target.value } : a))}
            placeholder="UUID"
            data-lpignore="true"
            data-1p-ignore="true"
            data-bwignore="true"
            autoComplete="off"
          />
        </div>

        <div>
          <label
            htmlFor="active-account"
            className="muted"
            style={{ display: "block", fontSize: 12 }}
          >
            Active account (used as X-Account-Id)
          </label>
          <select
            id="active-account"
            style={{ width: "100%", padding: 8 }}
            value={auth?.activeAccountId ?? ""}
            onChange={(e) => {
              const nextId = e.target.value;
              setAuth((a) => {
                if (!a) return a;
                const next = { ...a, activeAccountId: nextId };
                saveDevAuthToStorage(next);
                return next;
              });
            }}
            disabled={!accounts.length}
            data-lpignore="true"
            data-1p-ignore="true"
            data-bwignore="true"
          >
            {accounts.length ? null : <option value="">No accounts yet</option>}
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={onSaveHeaders} disabled={!auth}>
          Save headers
        </button>
        <button onClick={refresh} disabled={!canCallUserScoped}>
          Refresh
        </button>
      </div>

      {lastError ? (
        <pre className="errorBox" style={{ marginTop: 12 }}>
          {lastError}
        </pre>
      ) : null}

      <h2 style={{ marginTop: 24 }}>API context</h2>
      <pre className="codeBlock">
        {JSON.stringify(me, null, 2)}
      </pre>

      <h2 style={{ marginTop: 24 }}>Accounts</h2>
      <pre className="codeBlock">
        {JSON.stringify(accounts, null, 2)}
      </pre>

      <h3 style={{ marginTop: 16 }}>Create account</h3>
      <div style={{ display: "flex", gap: 12 }}>
        <input
          style={{ flex: 1, padding: 8 }}
          value={newAccountName}
          onChange={(e) => setNewAccountName(e.target.value)}
          placeholder="Account name"
          data-lpignore="true"
          data-1p-ignore="true"
          data-bwignore="true"
          autoComplete="off"
        />
        <button onClick={onCreateAccount} disabled={!newAccountName.trim() || !auth?.userId}>
          Create
        </button>
      </div>

      <h2 style={{ marginTop: 24 }}>Recipes (active account)</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Recipes are strictly scoped by <code>X-Account-Id</code>.
      </p>

      <pre className="codeBlock">
        {JSON.stringify(recipes, null, 2)}
      </pre>

      {recipes.length ? (
        <ul>
          {recipes.map((r) => (
            <li key={r.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ flex: 1 }}>
                <Link href={`/recipes/${r.id}/edit`}>{r.name}</Link>{" "}
                <span className="muted">{r.style ? `(${r.style})` : ""}</span>
              </span>
              <button
                type="button"
                onClick={() => void onDeleteRecipe(r)}
                aria-label={`Delete recipe ${r.name}`}
                disabled={!canCallAccountScoped}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">No recipes yet for this active account.</p>
      )}

      <h3 style={{ marginTop: 16 }}>Create recipe</h3>
      {recipeFormError ? (
        <p id="recipe-form-error" role="alert" style={{ marginTop: 8, color: "var(--danger)" }}>
          {recipeFormError}
        </p>
      ) : null}
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label
            htmlFor="recipe-name"
            className="muted"
            style={{ display: "block", fontSize: 12 }}
          >
            Recipe name
          </label>
          <input
            id="recipe-name"
            style={{ width: "100%", padding: 8 }}
            value={newRecipeName}
            onChange={(e) => setNewRecipeName(e.target.value)}
            aria-describedby={recipeFormError ? "recipe-form-error" : undefined}
            data-lpignore="true"
            data-1p-ignore="true"
            data-bwignore="true"
            autoComplete="off"
          />
        </div>
        <div>
          <label
            htmlFor="recipe-style"
            className="muted"
            style={{ display: "block", fontSize: 12 }}
          >
            Style (optional)
          </label>
          <input
            id="recipe-style"
            style={{ width: "100%", padding: 8 }}
            value={newRecipeStyle}
            onChange={(e) => setNewRecipeStyle(e.target.value)}
            data-lpignore="true"
            data-1p-ignore="true"
            data-bwignore="true"
            autoComplete="off"
          />
        </div>
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
        <button onClick={onCreateRecipe} disabled={!canCallAccountScoped}>
          Create recipe
        </button>
      </div>
    </section>
  );
}

