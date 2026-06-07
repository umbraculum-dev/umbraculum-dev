import * as SecureStore from "expo-secure-store";

export const AUTH_TOKEN_KEY = "brewery.auth.token";

export async function readToken(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    return token ?? null;
  } catch {
    return null;
  }
}

export async function writeToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export async function clearToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

