import { afterEach, describe, expect, it, vi } from 'vitest';
import { navigateTo, registerNavigationBridge } from './navigationBridge';

describe('navigationBridge', () => {
  afterEach(() => {
    registerNavigationBridge(undefined);
  });

  it('routes through the registered navigate function', () => {
    const navigate = vi.fn();
    registerNavigationBridge(navigate);

    navigateTo('/login');

    expect(navigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('forwards explicit navigation options', () => {
    const navigate = vi.fn();
    registerNavigationBridge(navigate);

    navigateTo('/dashboard', { replace: false });

    expect(navigate).toHaveBeenCalledWith('/dashboard', { replace: false });
  });

  it('replaces a previously registered navigate function', () => {
    const staleNavigate = vi.fn();
    const currentNavigate = vi.fn();
    registerNavigationBridge(staleNavigate);
    registerNavigationBridge(currentNavigate);

    navigateTo('/login');

    expect(staleNavigate).not.toHaveBeenCalled();
    expect(currentNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });
});
