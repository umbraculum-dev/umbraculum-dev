// src/locales.ts
var locales = ["en", "it"];
var defaultLocale = "en";
function isLocale(value) {
  return locales.includes(value);
}

export {
  locales,
  defaultLocale,
  isLocale
};
