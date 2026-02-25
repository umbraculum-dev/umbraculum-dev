export const NativeScreens = {
  Dashboard: "Dashboard",
  Recipes: "Recipes",
  Inventory: "Inventory",
  Login: "Login",
} as const;

export type NativeScreenName = (typeof NativeScreens)[keyof typeof NativeScreens];

