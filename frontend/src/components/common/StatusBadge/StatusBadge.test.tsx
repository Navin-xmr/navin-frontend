import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusBadge from './StatusBadge';

describe('StatusBadge component', () => {
    it('renders display label and applies badge classes for IN_TRANSIT', () => {
        render(<StatusBadge status={'IN_TRANSIT'} />);
        expect(screen.getByText('In Transit')).toBeInTheDocument();
        // class should include the blue token
        expect(screen.getByText('In Transit').className).toContain('#3b82f6');
    });
});
