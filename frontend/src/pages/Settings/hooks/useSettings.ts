import { useState } from 'react';
import { apiClient } from '@services/api/client';
import { useToast } from '../../../context/ToastContext';

type HttpMethod = 'patch' | 'post' | 'delete';

interface SaveOptions {
  url: string;
  method?: HttpMethod;
  payload?: unknown;
  /** Message shown in the success toast. Defaults to 'Saved successfully.' */
  successMessage?: string;
}

export function useSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { addToast } = useToast();

  const save = async ({ url, method = 'patch', payload, successMessage }: SaveOptions): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (method === 'delete') {
        await apiClient.delete(url);
      } else {
        await apiClient[method](url, payload);
      }
      const message = successMessage ?? 'Saved successfully.';
      setSuccess(message);
      addToast(message, 'success');
      setTimeout(() => setSuccess(null), 3000);
      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An error occurred. Please try again.';
      setError(message);
      addToast(message, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, success, save };
}
