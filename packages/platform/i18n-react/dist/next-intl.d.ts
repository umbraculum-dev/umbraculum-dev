import { Translator } from './index.js';
import 'react';
import '@umbraculum/i18n';

declare function useT(namespace: string): Translator;

export { useT };
