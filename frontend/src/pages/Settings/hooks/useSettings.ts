import { useState } from 'react';
import { apiClient } from '@services/api/client';

type HttpMethod = 'patch' | 'post' | 'delete';

interface SaveOptions {
  url: string;
  method?: HttpMethod;
  payload?: unknown;
}

export function useSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const save = async ({ url, method = 'patch', payload }: SaveOptions): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (method === 'delete') {
        await apiClient.delete(url);
      } else {
        await apiClient[method](url, payload);
      }
      setSuccess('Saved successfully.');
      setTimeout(() => setSuccess(null), 3000);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, success, save };
}
