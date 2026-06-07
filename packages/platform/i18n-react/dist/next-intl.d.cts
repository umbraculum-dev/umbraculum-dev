import { Translator } from './index.cjs';
import 'react/jsx-runtime';
import 'react';
import '@umbraculum/i18n';

declare function useT(namespace: string): Translator;

export { useT };
