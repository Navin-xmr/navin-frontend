import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompanyProfile from './CompanyProfile';

describe('CompanyProfile', () => {
  it('shows validation errors and unsaved state for contact details', async () => {
    const user = userEvent.setup();
    render(<CompanyProfile />);

    expect(screen.getByText('Company Profile')).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/phone/i);
    const websiteInput = screen.getByLabelText(/website/i);

    await user.type(emailInput, 'not-an-email');
    await user.type(phoneInput, 'abc');
    await user.type(websiteInput, 'not-a-url');

    expect(screen.getByLabelText(/unsaved changes/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /save contact details/i }));

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter a valid website url/i)).toBeInTheDocument();
  });
});
