import { Translator } from './index.cjs';
import 'react/jsx-runtime';
import 'react';
import '@brewery/i18n';

declare function useT(namespace: string): Translator;

export { useT };
