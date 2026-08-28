import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollSpy } from './useScrollSpy';

// The IntersectionObserver mock is defined in setup.ts as:
//   class IntersectionObserverMock { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn(); }
// It does NOT fire intersection callbacks — tests verify wiring only.

type MockIOConstructor = new (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
) => {
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};

describe('useScrollSpy', () => {
  beforeEach(() => {
    // Reset mock call history between tests
    const MockIO = window.IntersectionObserver as unknown as MockIOConstructor;
    const proto = (MockIO as unknown as { prototype: { observe: ReturnType<typeof vi.fn>; unobserve: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> } }).prototype;
    proto.observe.mockClear();
    proto.unobserve.mockClear();
    proto.disconnect.mockClear();
  });

  afterEach(() => {
    // Remove any test DOM elements
    document.querySelectorAll('[data-testid="spy-section"]').forEach((el) => el.remove());
  });

  const createSection = (id: string) => {
    const el = document.createElement('div');
    el.id = id;
    el.setAttribute('data-testid', 'spy-section');
    document.body.appendChild(el);
    return el;
  };

  it('returns null initially', () => {
    createSection('section-a');
    createSection('section-b');
    const { result } = renderHook(() => useScrollSpy(['section-a', 'section-b']));
    expect(result.current).toBeNull();
  });

  it('returns null when sectionIds is empty', () => {
    const { result } = renderHook(() => useScrollSpy([]));
    expect(result.current).toBeNull();
  });

  it('does not create IntersectionObserver when sectionIds is empty', () => {
    const constructorSpy = vi.spyOn(window, 'IntersectionObserver' as keyof Window);
    renderHook(() => useScrollSpy([]));
    expect(constructorSpy).not.toHaveBeenCalled();
    constructorSpy.mockRestore();
  });

  it('calls observer.observe for each section id that exists in DOM', () => {
    createSection('section-x');
    createSection('section-y');
    createSection('section-z');

    const { result } = renderHook(() =>
      useScrollSpy(['section-x', 'section-y', 'section-z']),
    );

    expect(result.current).toBeNull();

    const MockIO = window.IntersectionObserver as unknown as MockIOConstructor;
    const proto = (MockIO as unknown as { prototype: { observe: ReturnType<typeof vi.fn> } }).prototype;
    expect(proto.observe).toHaveBeenCalledTimes(3);
    expect(proto.observe).toHaveBeenCalledWith(document.getElementById('section-x'));
    expect(proto.observe).toHaveBeenCalledWith(document.getElementById('section-y'));
    expect(proto.observe).toHaveBeenCalledWith(document.getElementById('section-z'));
  });

  it('does not call observe for section ids not found in DOM', () => {
    createSection('section-exists');
    // 'section-missing' is NOT in DOM

    renderHook(() => useScrollSpy(['section-exists', 'section-missing']));

    const MockIO = window.IntersectionObserver as unknown as MockIOConstructor;
    const proto = (MockIO as unknown as { prototype: { observe: ReturnType<typeof vi.fn> } }).prototype;
    // Only one element exists, only one observe call
    expect(proto.observe).toHaveBeenCalledTimes(1);
    expect(proto.observe).toHaveBeenCalledWith(document.getElementById('section-exists'));
  });

  it('calls observer.disconnect on unmount', () => {
    createSection('section-unmount');

    const { unmount } = renderHook(() => useScrollSpy(['section-unmount']));

    unmount();

    const MockIO = window.IntersectionObserver as unknown as MockIOConstructor;
    const proto = (MockIO as unknown as { prototype: { disconnect: ReturnType<typeof vi.fn> } }).prototype;
    expect(proto.disconnect).toHaveBeenCalledTimes(1);
  });

  it('uses the default rootMargin (-40% 0px -55% 0px)', () => {
    createSection('section-margin');
    const constructorSpy = vi.spyOn(window, 'IntersectionObserver' as keyof Window);

    renderHook(() => useScrollSpy(['section-margin']));

    expect(constructorSpy).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ rootMargin: '-40% 0px -55% 0px' }),
    );

    constructorSpy.mockRestore();
  });

  it('accepts a custom rootMargin', () => {
    createSection('section-custom-margin');
    const constructorSpy = vi.spyOn(window, 'IntersectionObserver' as keyof Window);

    renderHook(() => useScrollSpy(['section-custom-margin'], '-20% 0px -30% 0px'));

    expect(constructorSpy).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ rootMargin: '-20% 0px -30% 0px' }),
    );

    constructorSpy.mockRestore();
  });

  it('re-observes when sectionIds change', () => {
    createSection('section-old');
    createSection('section-new');

    let ids = ['section-old'];
    const { rerender } = renderHook(() => useScrollSpy(ids));

    const MockIO = window.IntersectionObserver as unknown as MockIOConstructor;
    const proto = (MockIO as unknown as { prototype: { observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> } }).prototype;

    expect(proto.observe).toHaveBeenCalledTimes(1);

    ids = ['section-new'];
    rerender();

    // disconnect called for old observer, new observe called for new id
    expect(proto.disconnect).toHaveBeenCalled();
    expect(proto.observe).toHaveBeenCalledWith(document.getElementById('section-new'));
  });
});
