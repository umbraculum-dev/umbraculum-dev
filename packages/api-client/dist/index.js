// src/auth.ts
function cookieAuth() {
  return {
    credentials: "same-origin"
  };
}
function bearerTokenAuth(getToken) {
  return {
    getHeaders: () => {
      const token = getToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    }
  };
}

// src/client.ts
function joinPath(base, path) {
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return p ? `${b}/${p}` : b;
}
function createApiClient(baseUrl, auth, options) {
  const headers = () => ({
    "Content-Type": "application/json",
    ...auth.getHeaders?.()
  });
  const resolvedFetch = (() => {
    if (options?.fetch) return options.fetch;
    const f = globalThis.fetch;
    if (typeof f !== "function") {
      throw new Error("fetch is not available. Provide options.fetch when creating the API client.");
    }
    return f;
  })();
  async function request(path, init) {
    const url = joinPath(baseUrl, path);
    const creds = init.credentials ?? auth.credentials;
    const requestInit = {
      ...init,
      headers: {
        ...headers(),
        ...init.headers ?? {}
      },
      ...creds ? { credentials: creds } : {}
    };
    const res = await resolvedFetch(url, requestInit);
    const text = await res.text();
    let data = text;
    try {
      data = JSON.parse(text);
    } catch {
    }
    return { ok: res.ok, status: res.status, data };
  }
  return {
    get(path) {
      return request(path, { method: "GET" });
    },
    post(path, body) {
      return request(path, {
        method: "POST",
        ...body != null ? { body: JSON.stringify(body) } : {}
      });
    },
    put(path, body) {
      return request(path, {
        method: "PUT",
        ...body != null ? { body: JSON.stringify(body) } : {}
      });
    },
    patch(path, body) {
      return request(path, {
        method: "PATCH",
        ...body != null ? { body: JSON.stringify(body) } : {}
      });
    },
    delete(path) {
      return request(path, { method: "DELETE" });
    }
  };
}
export {
  bearerTokenAuth,
  cookieAuth,
  createApiClient
};
