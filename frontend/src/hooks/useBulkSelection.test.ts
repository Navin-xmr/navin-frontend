import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBulkSelection } from './useBulkSelection';

describe('useBulkSelection', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('starts with an empty selection', () => {
    const { result } = renderHook(() => useBulkSelection('test-key'));

    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.isSelected('a')).toBe(false);
  });

  it('toggleOne selects an unselected id', () => {
    const { result } = renderHook(() => useBulkSelection('test-key'));

    act(() => result.current.toggleOne('a'));

    expect(result.current.isSelected('a')).toBe(true);
    expect(result.current.selectedCount).toBe(1);
  });

  it('toggleOne deselects an already-selected id', () => {
    const { result } = renderHook(() => useBulkSelection('test-key'));

    act(() => result.current.toggleOne('a'));
    act(() => result.current.toggleOne('a'));

    expect(result.current.isSelected('a')).toBe(false);
    expect(result.current.selectedCount).toBe(0);
  });

  it('toggleOne only affects the given id, leaving others selected', () => {
    const { result } = renderHook(() => useBulkSelection('test-key'));

    act(() => result.current.toggleOne('a'));
    act(() => result.current.toggleOne('b'));
    act(() => result.current.toggleOne('a'));

    expect(result.current.isSelected('a')).toBe(false);
    expect(result.current.isSelected('b')).toBe(true);
    expect(result.current.selectedCount).toBe(1);
  });

  it('toggleAll selects every id in the list when not all are selected', () => {
    const { result } = renderHook(() => useBulkSelection('test-key'));

    act(() => result.current.toggleAll(['a', 'b', 'c']));

    expect(result.current.isSelected('a')).toBe(true);
    expect(result.current.isSelected('b')).toBe(true);
    expect(result.current.isSelected('c')).toBe(true);
    expect(result.current.selectedCount).toBe(3);
  });

  it('toggleAll deselects every id in the list when all are already selected', () => {
    const { result } = renderHook(() => useBulkSelection('test-key'));

    act(() => result.current.toggleAll(['a', 'b', 'c']));
    act(() => result.current.toggleAll(['a', 'b', 'c']));

    expect(result.current.selectedCount).toBe(0);
  });

  it('toggleAll selects remaining ids when only some are already selected (select-all semantics)', () => {
    const { result } = renderHook(() => useBulkSelection('test-key'));

    act(() => result.current.toggleOne('a'));
    act(() => result.current.toggleAll(['a', 'b', 'c']));

    expect(result.current.isSelected('a')).toBe(true);
    expect(result.current.isSelected('b')).toBe(true);
    expect(result.current.isSelected('c')).toBe(true);
    expect(result.current.selectedCount).toBe(3);
  });

  it('toggleAll preserves selections outside the given id list', () => {
    const { result } = renderHook(() => useBulkSelection('test-key'));

    act(() => result.current.toggleOne('z'));
    act(() => result.current.toggleAll(['a', 'b']));

    expect(result.current.isSelected('z')).toBe(true);
    expect(result.current.selectedCount).toBe(3);
  });

  it('toggleAll with an empty list is a no-op that does not clear existing selection', () => {
    const { result } = renderHook(() => useBulkSelection('test-key'));

    act(() => result.current.toggleOne('a'));
    act(() => result.current.toggleAll([]));

    expect(result.current.isSelected('a')).toBe(true);
    expect(result.current.selectedCount).toBe(1);
  });

  it('clearSelection empties the selection', () => {
    const { result } = renderHook(() => useBulkSelection('test-key'));

    act(() => result.current.toggleAll(['a', 'b', 'c']));
    act(() => result.current.clearSelection());

    expect(result.current.selectedCount).toBe(0);
    expect(result.current.selectedIds.size).toBe(0);
  });

  it('persists selection to sessionStorage under the given key', () => {
    const { result } = renderHook(() => useBulkSelection('persist-key'));

    act(() => result.current.toggleOne('a'));
    act(() => result.current.toggleOne('b'));

    const stored = JSON.parse(sessionStorage.getItem('persist-key') ?? '[]');
    expect(stored.sort()).toEqual(['a', 'b']);
  });

  it('restores selection from sessionStorage on mount', () => {
    sessionStorage.setItem('persist-key', JSON.stringify(['x', 'y']));

    const { result } = renderHook(() => useBulkSelection('persist-key'));

    expect(result.current.isSelected('x')).toBe(true);
    expect(result.current.isSelected('y')).toBe(true);
    expect(result.current.selectedCount).toBe(2);
  });

  it('falls back to an empty selection when sessionStorage contains invalid JSON', () => {
    sessionStorage.setItem('corrupt-key', '{not valid json');

    const { result } = renderHook(() => useBulkSelection('corrupt-key'));

    expect(result.current.selectedCount).toBe(0);
  });

  it('uses the default session key when none is provided', () => {
    const { result } = renderHook(() => useBulkSelection());

    act(() => result.current.toggleOne('a'));

    const stored = sessionStorage.getItem('shipments-bulk-selection');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored ?? '[]')).toEqual(['a']);
  });

  it('keeps selections for different session keys isolated from each other', () => {
    const { result: shipments } = renderHook(() => useBulkSelection('shipments-key'));
    const { result: notifications } = renderHook(() => useBulkSelection('notifications-key'));

    act(() => shipments.current.toggleOne('a'));

    expect(shipments.current.isSelected('a')).toBe(true);
    expect(notifications.current.isSelected('a')).toBe(false);
  });
});
