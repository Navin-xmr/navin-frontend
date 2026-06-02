import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('NotificationDropdown', () => {
  it('opens and displays notifications, closes on ESC and outside click', async () => {
    const user = userEvent.setup();

    renderWithRouter(<NotificationDropdown />);

    const bell = screen.getByLabelText('Notifications');
    await user.click(bell);

    expect(screen.getByText('Notifications')).toBeInTheDocument();

    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(5);

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByText('Notifications')).not.toBeInTheDocument());

    await user.click(bell);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    await user.click(document.body);
    await waitFor(() => expect(screen.queryByText('Notifications')).not.toBeInTheDocument());
  });

  it('renders the bell icon with unread badge', () => {
    renderWithRouter(<NotificationDropdown />);
    const bellButton = screen.getByLabelText('Notifications');
    expect(bellButton).toBeInTheDocument();

    const badge = screen.getByText('3');
    expect(badge).toBeInTheDocument();
  });
});
  it('renders the bell icon with unread badge', () => {
    renderWithRouter(<NotificationDropdown />);
    
    const bellButton = screen.getByLabelText('Notifications');
    expect(bellButton).toBeInTheDocument();
    
    const badge = screen.getByText('3');
    expect(badge).toBeInTheDocument();
  });

  it('opens dropdown when bell icon is clicked', () => {
    renderWithRouter(<NotificationDropdown />);
    
    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);
    
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('View All Notifications')).toBeInTheDocument();
  });

  it('displays 5 notifications in the dropdown', () => {
    renderWithRouter(<NotificationDropdown />);
    
    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);
    
    expect(screen.getByText(/Shipment #SH-2024-001 has been delivered successfully/)).toBeInTheDocument();
    expect(screen.getByText(/Payment of 5,000 XLM received/)).toBeInTheDocument();
    expect(screen.getByText(/Shipment #SH-2024-003 is delayed/)).toBeInTheDocument();
  });

  it('closes dropdown when close button is clicked', () => {
    renderWithRouter(<NotificationDropdown />);
    
    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);
    
    const closeButton = screen.getByLabelText('Close notifications');
    fireEvent.click(closeButton);
    
    expect(screen.queryByText('View All Notifications')).not.toBeInTheDocument();
  });

  it('closes dropdown when ESC key is pressed', () => {
    renderWithRouter(<NotificationDropdown />);
    
    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);
    
    expect(screen.getByText('View All Notifications')).toBeInTheDocument();
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(screen.queryByText('View All Notifications')).not.toBeInTheDocument();
  });

