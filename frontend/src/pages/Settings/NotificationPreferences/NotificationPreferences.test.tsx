import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationPreferences from './NotificationPreferences';
import * as notificationsEndpoint from '@services/api/endpoints/notifications';

// ---- Helpers ----

const mockGetPreferences = vi.fn();
const mockUpdatePreference = vi.fn();
const mockSendOtp = vi.fn();
const mockVerifyOtp = vi.fn();

beforeEach(() => {
  mockGetPreferences.mockClear();
  mockUpdatePreference.mockClear();
  mockSendOtp.mockClear();
  mockVerifyOtp.mockClear();
  vi.spyOn(notificationsEndpoint.notificationPreferencesApi, 'getPreferences').mockImplementation(mockGetPreferences);
  vi.spyOn(notificationsEndpoint.notificationPreferencesApi, 'updatePreference').mockImplementation(mockUpdatePreference);
  vi.spyOn(notificationsEndpoint.notificationPreferencesApi, 'sendOtp').mockImplementation(mockSendOtp);
  vi.spyOn(notificationsEndpoint.notificationPreferencesApi, 'verifyOtp').mockImplementation(mockVerifyOtp);

  // Default: resolve immediately with all-off preferences
  mockGetPreferences.mockResolvedValue({
    shipment_created: { email: false, sms: false },
    status_changed: { email: false, sms: false },
    delivery_confirmed: { email: false, sms: false },
    payment_received: { email: false, sms: false },
    dispute_opened: { email: false, sms: false },
    dispute_resolved: { email: false, sms: false },
  });
  mockUpdatePreference.mockResolvedValue(undefined);
  mockSendOtp.mockResolvedValue(undefined);
  mockVerifyOtp.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---- Rendering ----

describe('rendering', () => {
  it('renders all 6 event types', async () => {
    render(<NotificationPreferences />);
    await waitFor(() => expect(mockGetPreferences).toHaveBeenCalledTimes(1));

    expect(screen.getByLabelText('Shipment Created email notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Status Changed email notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Delivery Confirmed email notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Payment Received email notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Dispute Opened email notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Dispute Resolved email notifications')).toBeInTheDocument();
  });

  it('renders all 3 category headings', async () => {
    render(<NotificationPreferences />);
    await waitFor(() => expect(mockGetPreferences).toHaveBeenCalledTimes(1));

    expect(screen.getByText('Shipments')).toBeInTheDocument();
    expect(screen.getByText('Payments')).toBeInTheDocument();
    expect(screen.getByText('Disputes')).toBeInTheDocument();
  });

  it('renders both Email and SMS toggles for each event', async () => {
    render(<NotificationPreferences />);
    await waitFor(() => expect(mockGetPreferences).toHaveBeenCalledTimes(1));

    expect(screen.getByLabelText('Shipment Created email notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Shipment Created SMS notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Payment Received email notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Payment Received SMS notifications')).toBeInTheDocument();
  });
});

// ---- Toggle behaviour ----

describe('toggle behaviour', () => {
  it('calls updatePreference with correct args when email toggle is clicked', async () => {
    render(<NotificationPreferences />);
    await waitFor(() => expect(mockGetPreferences).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByLabelText('Shipment Created email notifications'));

    await waitFor(() =>
      expect(mockUpdatePreference).toHaveBeenCalledWith('shipment_created', 'email', true),
    );
  });

  it('applies optimistic update immediately', async () => {
    render(<NotificationPreferences />);
    await waitFor(() => expect(mockGetPreferences).toHaveBeenCalledTimes(1));

    const toggle = screen.getByLabelText('Payment Received email notifications') as HTMLInputElement;
    expect(toggle.checked).toBe(false);

    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
  });

  it('rolls back on API error', async () => {
    mockUpdatePreference.mockRejectedValueOnce(new Error('Network error'));
    render(<NotificationPreferences />);
    await waitFor(() => expect(mockGetPreferences).toHaveBeenCalledTimes(1));

    const toggle = screen.getByLabelText('Dispute Opened email notifications') as HTMLInputElement;
    expect(toggle.checked).toBe(false);

    fireEvent.click(toggle);
    // Optimistic: toggled on
    expect(toggle.checked).toBe(true);

    // After rejection: rolled back
    await waitFor(() => expect(toggle.checked).toBe(false));
  });

  it('shows inline Saved indicator after successful update', async () => {
    render(<NotificationPreferences />);
    await waitFor(() => expect(mockGetPreferences).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByLabelText('Status Changed email notifications'));

    await waitFor(() => expect(screen.getByText('Saved')).toBeInTheDocument());
  });
});

// ---- Phone verification ----

describe('phone verification', () => {
  it('SMS toggles are disabled before phone verification', async () => {
    render(<NotificationPreferences />);
    await waitFor(() => expect(mockGetPreferences).toHaveBeenCalledTimes(1));

    const smsToggle = screen.getByLabelText('Shipment Created SMS notifications') as HTMLInputElement;
    expect(smsToggle).toBeDisabled();
  });

  it('shows verification required message before verification', async () => {
    render(<NotificationPreferences />);
    await waitFor(() => expect(mockGetPreferences).toHaveBeenCalledTimes(1));

    expect(screen.getByText('Phone verification required to enable SMS')).toBeInTheDocument();
  });

  it('sends OTP when Send OTP is clicked with a phone number', async () => {
    render(<NotificationPreferences />);
    await waitFor(() => expect(mockGetPreferences).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '+15550001234' } });
    fireEvent.click(screen.getByLabelText('Send OTP'));

    await waitFor(() => expect(mockSendOtp).toHaveBeenCalledWith('+15550001234'));
    expect(screen.getByLabelText('Verification code')).toBeInTheDocument();
  });

  it('shows error if Send OTP clicked without phone number', async () => {
    render(<NotificationPreferences />);
    await waitFor(() => expect(mockGetPreferences).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByLabelText('Send OTP'));

    expect(screen.getByText('Please enter a phone number.')).toBeInTheDocument();
    expect(mockSendOtp).not.toHaveBeenCalled();
  });

  it('verifies OTP and enables SMS toggles', async () => {
    render(<NotificationPreferences />);
    await waitFor(() => expect(mockGetPreferences).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '+15550001234' } });
    fireEvent.click(screen.getByLabelText('Send OTP'));
    await waitFor(() => expect(mockSendOtp).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText('Verification code'), { target: { value: '123456' } });
    fireEvent.click(screen.getByLabelText('Verify OTP'));

    await waitFor(() => expect(mockVerifyOtp).toHaveBeenCalledWith('+15550001234', '123456'));

    // SMS toggles should now be enabled
    const smsToggle = screen.getByLabelText('Shipment Created SMS notifications') as HTMLInputElement;
    expect(smsToggle).not.toBeDisabled();

    // Verified badge appears
    expect(screen.getByLabelText('Phone verified')).toBeInTheDocument();
  });

  it('shows error when OTP verification fails', async () => {
    mockVerifyOtp.mockRejectedValueOnce(new Error('Invalid OTP'));
    render(<NotificationPreferences />);
    await waitFor(() => expect(mockGetPreferences).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '+15550001234' } });
    fireEvent.click(screen.getByLabelText('Send OTP'));
    await waitFor(() => expect(mockSendOtp).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText('Verification code'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByLabelText('Verify OTP'));

    await waitFor(() =>
      expect(screen.getByText('Verification failed. Please check the code and try again.')).toBeInTheDocument(),
    );

    // SMS toggles remain disabled
    expect(screen.getByLabelText('Shipment Created SMS notifications')).toBeDisabled();
  });
});

// ---- Persistence ----

describe('persistence', () => {
  it('loads saved preferences from API on mount', async () => {
    mockGetPreferences.mockResolvedValue({
      shipment_created: { email: true, sms: false },
      status_changed: { email: false, sms: false },
      delivery_confirmed: { email: true, sms: false },
      payment_received: { email: false, sms: false },
      dispute_opened: { email: false, sms: false },
      dispute_resolved: { email: true, sms: false },
    });

    render(<NotificationPreferences />);
    await waitFor(() => expect(mockGetPreferences).toHaveBeenCalledTimes(1));

    const shipmentCreatedEmail = screen.getByLabelText('Shipment Created email notifications') as HTMLInputElement;
    expect(shipmentCreatedEmail.checked).toBe(true);

    const statusChangedEmail = screen.getByLabelText('Status Changed email notifications') as HTMLInputElement;
    expect(statusChangedEmail.checked).toBe(false);

    const disputeResolvedEmail = screen.getByLabelText('Dispute Resolved email notifications') as HTMLInputElement;
    expect(disputeResolvedEmail.checked).toBe(true);
  });

  it('keeps defaults when API call fails on mount', async () => {
    mockGetPreferences.mockRejectedValueOnce(new Error('Network error'));
    render(<NotificationPreferences />);

    await waitFor(() =>
      expect(screen.getByLabelText('Shipment Created email notifications')).toBeInTheDocument(),
    );

    const toggle = screen.getByLabelText('Shipment Created email notifications') as HTMLInputElement;
    expect(toggle.checked).toBe(false);
  });
});
