import * as SecureStore from "expo-secure-store";

export async function readString(key: string): Promise<string | null> {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value ?? null;
  } catch {
    return null;
  }
}

export async function writeString(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // ignore storage failures (e.g. simulator/keychain issues)
  }
}

