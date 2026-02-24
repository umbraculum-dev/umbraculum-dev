import { Translator } from './index.js';
import 'react/jsx-runtime';
import 'react';
import '@brewery/i18n';

declare function useT(namespace: string): Translator;

export { useT };
