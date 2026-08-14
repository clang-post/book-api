import { createContext, useContext } from 'react';

export const ErrorContext = createContext<(message: string) => void>(() => {});

export function useShowError() {
  return useContext(ErrorContext);
}
