import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExceptionDashboard from './ExceptionDashboard';

describe('ExceptionDashboard', () => {
  it('renders KPI cards, filters, and inline resolution controls', async () => {
    const user = userEvent.setup();
    render(<ExceptionDashboard />);

    expect(screen.getByText(/exception rate dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/total exceptions this week/i)).toBeInTheDocument();
    expect(screen.getByText(/exception trend/i)).toBeInTheDocument();
    expect(screen.getByText(/open exceptions/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/filter/i), 'DELAYED');
    await user.click(screen.getAllByRole('button', { name: /resolve/i })[0]);

    expect(screen.getByPlaceholderText(/add an update/i)).toBeInTheDocument();
  });
});
