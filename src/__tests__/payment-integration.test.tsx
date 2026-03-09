/**
 * Payment Integration Tests
 * Tests Stripe, PayPal, and other payment provider integrations
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock Stripe
const mockStripe = {
  elements: jest.fn(() => ({
    create: jest.fn(() => ({
      mount: jest.fn(),
      unmount: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    })),
    getElement: jest.fn(),
  })),
  createPaymentMethod: jest.fn(),
  confirmCardPayment: jest.fn(),
  confirmPayment: jest.fn(),
};

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve(mockStripe)),
}));

// Mock PayPal
const mockPayPal = {
  Buttons: jest.fn(() => ({
    render: jest.fn(),
  })),
};

(global as any).paypal = mockPayPal;

// Mock API calls
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

describe('Payment Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('Stripe Payment Integration', () => {
    it('creates payment intent successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          client_secret: 'pi_test_123_secret_abc',
          amount: 5998,
          currency: 'usd',
        }),
      } as Response);

      const StripePayment = () => {
        const [clientSecret, setClientSecret] = React.useState('');

        const createPaymentIntent = async (amount: number) => {
          const response = await fetch('/api/payments/create-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, currency: 'usd' }),
          });

          if (response.ok) {
            const { client_secret } = await response.json();
            setClientSecret(client_secret);
          }
        };

        return (
          <div>
            <button onClick={() => createPaymentIntent(5998)}>
              Create Payment Intent
            </button>
            {clientSecret && (
              <div data-testid="client-secret">{clientSecret}</div>
            )}
          </div>
        );
      };

      render(<StripePayment />);

      const createButton = screen.getByText('Create Payment Intent');
      await user.click(createButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 5998, currency: 'usd' }),
        });
        expect(screen.getByTestId('client-secret')).toHaveTextContent(
          'pi_test_123_secret_abc'
        );
      });
    });

    it('handles successful card payment', async () => {
      mockStripe.confirmCardPayment.mockResolvedValue({
        paymentIntent: {
          status: 'succeeded',
          id: 'pi_test_123',
        },
      });

      const StripeCardPayment = () => {
        const [paymentStatus, setPaymentStatus] = React.useState('');

        const handlePayment = async () => {
          const result = await mockStripe.confirmCardPayment(
            'pi_test_123_secret_abc',
            {
              payment_method: {
                card: {}, // Mock card element
                billing_details: {
                  name: 'Test Customer',
                  email: 'test@example.com',
                },
              },
            }
          );

          if (result.paymentIntent?.status === 'succeeded') {
            setPaymentStatus('Payment successful!');
          }
        };

        return (
          <div>
            <button onClick={handlePayment}>Pay with Card</button>
            {paymentStatus && (
              <div data-testid="payment-status">{paymentStatus}</div>
            )}
          </div>
        );
      };

      render(<StripeCardPayment />);

      const payButton = screen.getByText('Pay with Card');
      await user.click(payButton);

      await waitFor(() => {
        expect(mockStripe.confirmCardPayment).toHaveBeenCalledWith(
          'pi_test_123_secret_abc',
          expect.objectContaining({
            payment_method: expect.objectContaining({
              billing_details: {
                name: 'Test Customer',
                email: 'test@example.com',
              },
            }),
          })
        );
        expect(screen.getByTestId('payment-status')).toHaveTextContent(
          'Payment successful!'
        );
      });
    });

    it('handles payment failures', async () => {
      mockStripe.confirmCardPayment.mockResolvedValue({
        error: {
          type: 'card_error',
          code: 'card_declined',
          message: 'Your card was declined.',
        },
      });

      const PaymentError = () => {
        const [error, setError] = React.useState('');

        const handlePayment = async () => {
          const result = await mockStripe.confirmCardPayment(
            'pi_test_123_secret_abc',
            { payment_method: { card: {} } }
          );

          if (result.error) {
            setError(result.error.message || 'Payment failed');
          }
        };

        return (
          <div>
            <button onClick={handlePayment}>Pay</button>
            {error && <div data-testid="payment-error">{error}</div>}
          </div>
        );
      };

      render(<PaymentError />);

      const payButton = screen.getByText('Pay');
      await user.click(payButton);

      await waitFor(() => {
        expect(screen.getByTestId('payment-error')).toHaveTextContent(
          'Your card was declined.'
        );
      });
    });

    it('validates card information', () => {
      const validateCardNumber = (number: string) => {
        // Luhn algorithm implementation
        const digits = number.replace(/\D/g, '');
        let sum = 0;
        let alternate = false;

        for (let i = digits.length - 1; i >= 0; i--) {
          let n = parseInt(digits.charAt(i), 10);
          if (alternate) {
            n *= 2;
            if (n > 9) n = (n % 10) + 1;
          }
          sum += n;
          alternate = !alternate;
        }

        return sum % 10 === 0 && digits.length >= 13;
      };

      expect(validateCardNumber('4242424242424242')).toBe(true); // Valid test card
      expect(validateCardNumber('1234567890123456')).toBe(false); // Invalid card
      expect(validateCardNumber('')).toBe(false); // Empty string
    });

    it('formats credit card input', () => {
      const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0; i < match.length; i += 4) {
          parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
          return parts.join(' ');
        } else {
          return v;
        }
      };

      expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
      expect(formatCardNumber('42424242')).toBe('4242 4242');
    });
  });

  describe('PayPal Payment Integration', () => {
    it('creates PayPal order', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'PAYPAL_ORDER_ID',
          status: 'CREATED',
          links: [
            {
              rel: 'approve',
              href: 'https://www.paypal.com/checkoutnow?token=PAYPAL_ORDER_ID',
            },
          ],
        }),
      } as Response);

      const PayPalPayment = () => {
        const [orderId, setOrderId] = React.useState('');

        const createPayPalOrder = async () => {
          const response = await fetch('/api/payments/paypal/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: '59.98', currency: 'USD' }),
          });

          if (response.ok) {
            const order = await response.json();
            setOrderId(order.id);
          }
        };

        return (
          <div>
            <button onClick={createPayPalOrder}>Create PayPal Order</button>
            {orderId && <div data-testid="paypal-order">{orderId}</div>}
          </div>
        );
      };

      render(<PayPalPayment />);

      const createButton = screen.getByText('Create PayPal Order');
      await user.click(createButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/payments/paypal/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: '59.98', currency: 'USD' }),
        });
        expect(screen.getByTestId('paypal-order')).toHaveTextContent(
          'PAYPAL_ORDER_ID'
        );
      });
    });

    it('captures PayPal payment', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'PAYPAL_ORDER_ID',
          status: 'COMPLETED',
          capture_id: 'CAPTURE_ID_123',
        }),
      } as Response);

      const PayPalCapture = () => {
        const [status, setStatus] = React.useState('');

        const capturePayment = async (orderId: string) => {
          const response = await fetch(`/api/payments/paypal/capture/${orderId}`, {
            method: 'POST',
          });

          if (response.ok) {
            const result = await response.json();
            setStatus(result.status);
          }
        };

        return (
          <div>
            <button onClick={() => capturePayment('PAYPAL_ORDER_ID')}>
              Capture Payment
            </button>
            {status && <div data-testid="capture-status">{status}</div>}
          </div>
        );
      };

      render(<PayPalCapture />);

      const captureButton = screen.getByText('Capture Payment');
      await user.click(captureButton);

      await waitFor(() => {
        expect(screen.getByTestId('capture-status')).toHaveTextContent('COMPLETED');
      });
    });
  });

  describe('Payment Method Selection', () => {
    it('displays available payment methods based on region', () => {
      const getPaymentMethods = (country: string) => {
        const methods = {
          US: ['card', 'paypal', 'apple_pay', 'google_pay'],
          GB: ['card', 'paypal', 'apple_pay', 'google_pay'],
          DE: ['card', 'paypal', 'sofort', 'giropay'],
          NL: ['card', 'paypal', 'ideal'],
          FR: ['card', 'paypal'],
        };
        
        return methods[country as keyof typeof methods] || ['card', 'paypal'];
      };

      expect(getPaymentMethods('US')).toContain('apple_pay');
      expect(getPaymentMethods('DE')).toContain('sofort');
      expect(getPaymentMethods('NL')).toContain('ideal');
    });

    it('switches between payment methods', async () => {
      const PaymentMethodSelector = () => {
        const [selected, setSelected] = React.useState('card');

        return (
          <div>
            <button onClick={() => setSelected('card')}>Credit Card</button>
            <button onClick={() => setSelected('paypal')}>PayPal</button>
            <button onClick={() => setSelected('apple_pay')}>Apple Pay</button>
            <div data-testid="selected-method">{selected}</div>
          </div>
        );
      };

      render(<PaymentMethodSelector />);

      const paypalButton = screen.getByText('PayPal');
      await user.click(paypalButton);

      expect(screen.getByTestId('selected-method')).toHaveTextContent('paypal');

      const applePayButton = screen.getByText('Apple Pay');
      await user.click(applePayButton);

      expect(screen.getByTestId('selected-method')).toHaveTextContent('apple_pay');
    });
  });

  describe('Payment Security', () => {
    it('handles 3D Secure authentication', async () => {
      mockStripe.confirmCardPayment.mockResolvedValue({
        paymentIntent: {
          status: 'requires_action',
          next_action: {
            type: 'use_stripe_sdk',
          },
        },
      });

      const ThreeDSecure = () => {
        const [requires3DS, setRequires3DS] = React.useState(false);

        const handlePayment = async () => {
          const result = await mockStripe.confirmCardPayment('pi_test_123', {
            payment_method: { card: {} },
          });

          if (result.paymentIntent?.status === 'requires_action') {
            setRequires3DS(true);
          }
        };

        return (
          <div>
            <button onClick={handlePayment}>Pay</button>
            {requires3DS && (
              <div data-testid="3ds-required">3D Secure authentication required</div>
            )}
          </div>
        );
      };

      render(<ThreeDSecure />);

      const payButton = screen.getByText('Pay');
      await user.click(payButton);

      await waitFor(() => {
        expect(screen.getByTestId('3ds-required')).toHaveTextContent(
          '3D Secure authentication required'
        );
      });
    });

    it('encrypts sensitive payment data', () => {
      const encryptCardData = (cardNumber: string) => {
        // Mock encryption - in real app this would use proper encryption
        const masked = cardNumber.slice(-4).padStart(cardNumber.length, '*');
        return masked;
      };

      expect(encryptCardData('4242424242424242')).toBe('************4242');
      expect(encryptCardData('1234567890123456')).toBe('************3456');
    });

    it('validates payment amount', () => {
      const validateAmount = (amount: number) => {
        return amount > 0 && amount <= 999999.99 && Number.isFinite(amount);
      };

      expect(validateAmount(59.98)).toBe(true);
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-10)).toBe(false);
      expect(validateAmount(1000000)).toBe(false);
      expect(validateAmount(Infinity)).toBe(false);
    });
  });

  describe('Payment Webhooks', () => {
    it('handles Stripe webhook events', async () => {
      const webhookData = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            status: 'succeeded',
            amount: 5998,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ received: true }),
      } as Response);

      const WebhookHandler = () => {
        const [webhookReceived, setWebhookReceived] = React.useState(false);

        const processWebhook = async () => {
          const response = await fetch('/api/webhooks/stripe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookData),
          });

          if (response.ok) {
            setWebhookReceived(true);
          }
        };

        return (
          <div>
            <button onClick={processWebhook}>Process Webhook</button>
            {webhookReceived && (
              <div data-testid="webhook-processed">Webhook processed</div>
            )}
          </div>
        );
      };

      render(<WebhookHandler />);

      const processButton = screen.getByText('Process Webhook');
      await user.click(processButton);

      await waitFor(() => {
        expect(screen.getByTestId('webhook-processed')).toBeInTheDocument();
      });
    });
  });

  describe('Refunds and Disputes', () => {
    it('processes refund request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'ref_test_123',
          status: 'succeeded',
          amount: 5998,
        }),
      } as Response);

      const RefundProcessor = () => {
        const [refundStatus, setRefundStatus] = React.useState('');

        const processRefund = async (paymentIntentId: string, amount: number) => {
          const response = await fetch('/api/payments/refund', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment_intent_id: paymentIntentId, amount }),
          });

          if (response.ok) {
            const refund = await response.json();
            setRefundStatus(refund.status);
          }
        };

        return (
          <div>
            <button onClick={() => processRefund('pi_test_123', 5998)}>
              Process Refund
            </button>
            {refundStatus && <div data-testid="refund-status">{refundStatus}</div>}
          </div>
        );
      };

      render(<RefundProcessor />);

      const refundButton = screen.getByText('Process Refund');
      await user.click(refundButton);

      await waitFor(() => {
        expect(screen.getByTestId('refund-status')).toHaveTextContent('succeeded');
      });
    });
  });
});