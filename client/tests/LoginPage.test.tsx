import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../src/pages/auth/LoginPage';
import { useAuthStore } from '../src/store/authStore';

// Mock the auth store
jest.mock('../src/store/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock react-router-dom
const MockRouter = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

// Mock toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('LoginPage', () => {
  const mockLogin = jest.fn();
  const mockSetLoading = jest.fn();
  const mockSetError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      loading: false,
      error: null,
      setLoading: mockSetLoading,
      setError: mockSetError,
    } as any);
  });

  it('renders login form elements', () => {
    render(
      <MockRouter>
        <LoginPage />
      </MockRouter>
    );

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/create a new account/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(
      <MockRouter>
        <LoginPage />
      </MockRouter>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Email is required/)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    render(
      <MockRouter>
        <LoginPage />
      </MockRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/)).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    render(
      <MockRouter>
        <LoginPage />
      </MockRouter>
    );

    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: '123' } });

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters/)).toBeInTheDocument();
    });
  });

  it('calls login function with correct credentials', async () => {
    mockLogin.mockResolvedValue({});

    render(
      <MockRouter>
        <LoginPage />
      </MockRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'TestPass123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'TestPass123!');
    });
  });

  it('shows loading state during login', () => {
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      loading: true,
      error: null,
      setLoading: mockSetLoading,
      setError: mockSetError,
    } as any);

    render(
      <MockRouter>
        <LoginPage />
      </MockRouter>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeDisabled();

    // Check for loading dots
    expect(submitButton.querySelector('.loading-dots')).toBeInTheDocument();
  });

  it('shows error message when login fails', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValue({
      response: { data: { error: errorMessage } }
    });

    render(
      <MockRouter>
        <LoginPage />
      </MockRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    render(
      <MockRouter>
        <LoginPage />
      </MockRouter>
    );

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

    expect(passwordInput.type).toBe('password');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('displays demo credentials', () => {
    render(
      <MockRouter>
        <LoginPage />
      </MockRouter>
    );

    expect(screen.getByText(/Demo Credentials:/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@local.test\/AdminPass123!/i)).toBeInTheDocument();
    expect(screen.getByText(/farmer@example.com\/FarmerPass123!/i)).toBeInTheDocument();
  });

  it('has forgot password link', () => {
    render(
      <MockRouter>
        <LoginPage />
      </MockRouter>
    );

    const forgotPasswordLink = screen.getByText(/Forgot your password\?/);
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password');
  });
});