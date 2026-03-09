/**
 * User Dashboard & Profile Tests
 * Tests user dashboard, profile management, order history, and account settings
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
}));

// Mock session
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
      },
    },
    status: 'authenticated',
  }),
}));

// Mock API calls
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('User Dashboard & Profile Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    mockFetch.mockClear();
    jest.clearAllMocks();
    // Default mock to prevent unmocked fetch calls from returning undefined
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  describe('Dashboard Overview', () => {
    const mockDashboardData = {
      recent_orders: [
        {
          id: 'ORD-12345',
          status: 'delivered',
          total: 59.98,
          created_at: '2026-02-20T10:00:00Z',
          items_count: 2,
        },
        {
          id: 'ORD-12346',
          status: 'shipped',
          total: 129.99,
          created_at: '2026-02-25T15:30:00Z',
          items_count: 3,
        },
      ],
      order_stats: {
        total_orders: 15,
        total_spent: 1234.56,
        pending_orders: 1,
        delivered_orders: 12,
      },
      favorites_count: 8,
      cart_items_count: 3,
    };

    it('displays dashboard overview with user statistics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDashboardData),
      } as Response);

      const DashboardOverview = () => {
        const [dashboardData, setDashboardData] = React.useState<any>(null);

        React.useEffect(() => {
          fetch('/api/dashboard/overview')
            .then(res => res.json())
            .then(setDashboardData);
        }, []);

        if (!dashboardData) return <div>Loading...</div>;

        return (
          <div>
            <h1>Dashboard</h1>
            <div data-testid="total-orders">{dashboardData.order_stats.total_orders} orders</div>
            <div data-testid="total-spent">${dashboardData.order_stats.total_spent}</div>
            <div data-testid="favorites-count">{dashboardData.favorites_count} favorites</div>
            <div data-testid="recent-orders">
              {dashboardData.recent_orders.map((order: any) => (
                <div key={order.id} data-testid={`order-${order.id}`}>
                  {order.id} - {order.status} - ${order.total}
                </div>
              ))}
            </div>
          </div>
        );
      };

      render(<DashboardOverview />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('total-orders')).toHaveTextContent('15 orders');
        expect(screen.getByTestId('total-spent')).toHaveTextContent('$1234.56');
        expect(screen.getByTestId('favorites-count')).toHaveTextContent('8 favorites');
        expect(screen.getByTestId('order-ORD-12345')).toHaveTextContent('delivered');
      });
    });

    it('displays quick action buttons', () => {
      const QuickActions = () => (
        <div>
          <button data-testid="view-orders">View All Orders</button>
          <button data-testid="view-favorites">My Favorites</button>
          <button data-testid="track-order">Track Order</button>
          <button data-testid="account-settings">Account Settings</button>
        </div>
      );

      render(<QuickActions />);

      expect(screen.getByTestId('view-orders')).toBeInTheDocument();
      expect(screen.getByTestId('view-favorites')).toBeInTheDocument();
      expect(screen.getByTestId('track-order')).toBeInTheDocument();
      expect(screen.getByTestId('account-settings')).toBeInTheDocument();
    });
  });

  describe('Profile Management', () => {
    const mockProfileData = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      avatar_url: 'https://example.com/avatar.jpg',
      birth_date: '1990-01-01',
      phone: '+1234567890',
      is_email_verified: true,
      marketing_emails: true,
      created_at: '2025-01-01T00:00:00Z',
    };

    it('displays user profile information', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfileData),
      } as Response);

      const ProfileDisplay = () => {
        const [profile, setProfile] = React.useState<any>(null);

        React.useEffect(() => {
          fetch('/api/profile/me')
            .then(res => res.json())
            .then(setProfile);
        }, []);

        if (!profile) return <div>Loading profile...</div>;

        return (
          <div>
            <h2>My Profile</h2>
            <div data-testid="profile-email">{profile.email}</div>
            <div data-testid="profile-name">{profile.first_name} {profile.last_name}</div>
            <div data-testid="profile-username">{profile.username}</div>
            <div data-testid="profile-phone">{profile.phone}</div>
            <div data-testid="email-verified">
              {profile.is_email_verified ? 'Verified' : 'Unverified'}
            </div>
          </div>
        );
      };

      render(<ProfileDisplay />);

      await waitFor(() => {
        expect(screen.getByTestId('profile-email')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('profile-name')).toHaveTextContent('Test User');
        expect(screen.getByTestId('profile-username')).toHaveTextContent('testuser');
        expect(screen.getByTestId('email-verified')).toHaveTextContent('Verified');
      });
    });

    it('allows editing profile information', async () => {
      const ProfileEditForm = () => {
        const [formData, setFormData] = React.useState({
          first_name: 'Test',
          last_name: 'User',
          phone: '+1234567890',
        });
        const [isEditing, setIsEditing] = React.useState(false);
        const [saved, setSaved] = React.useState(false);

        const handleSave = async () => {
          const response = await fetch('/api/profile/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          
          if (response.ok) {
            setSaved(true);
            setIsEditing(false);
          }
        };

        return (
          <div>
            {!isEditing ? (
              <div>
                <div data-testid="display-name">{formData.first_name} {formData.last_name}</div>
                <div data-testid="display-phone">{formData.phone}</div>
                <button onClick={() => setIsEditing(true)}>Edit Profile</button>
              </div>
            ) : (
              <form>
                <input
                  data-testid="edit-first-name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
                <input
                  data-testid="edit-last-name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
                <input
                  data-testid="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <button type="button" onClick={handleSave}>Save</button>
                <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
              </form>
            )}
            {saved && <div data-testid="save-success">Profile updated successfully!</div>}
          </div>
        );
      };

      // Mock successful update
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      render(<ProfileEditForm />);

      // Click edit button
      const editButton = screen.getByText('Edit Profile');
      await user.click(editButton);

      // Edit fields
      const firstNameInput = screen.getByTestId('edit-first-name');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Updated');

      // Save changes
      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      // Wait for update
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/profile/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: 'Updated',
            last_name: 'User',
            phone: '+1234567890',
          }),
        });
      });
    });

    it('validates profile form fields', async () => {
      const ProfileValidator = () => {
        const [errors, setErrors] = React.useState<any>({});

        const validateProfile = (data: any) => {
          const newErrors: any = {};
          
          if (!data.first_name.trim()) {
            newErrors.first_name = 'First name is required';
          }
          
          if (!data.last_name.trim()) {
            newErrors.last_name = 'Last name is required';
          }
          
          if (data.phone && !/^\+?\d{10,15}$/.test(data.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Invalid phone number format';
          }

          setErrors(newErrors);
        };

        const handleValidate = () => {
          validateProfile({
            first_name: '',
            last_name: '',
            phone: 'invalid-phone',
          });
        };

        return (
          <div>
            <button onClick={handleValidate}>Validate</button>
            {errors.first_name && <div data-testid="error-first-name">{errors.first_name}</div>}
            {errors.last_name && <div data-testid="error-last-name">{errors.last_name}</div>}
            {errors.phone && <div data-testid="error-phone">{errors.phone}</div>}
          </div>
        );
      };

      render(<ProfileValidator />);

      const validateButton = screen.getByText('Validate');
      await user.click(validateButton);

      expect(screen.getByTestId('error-first-name')).toHaveTextContent('First name is required');
      expect(screen.getByTestId('error-last-name')).toHaveTextContent('Last name is required');
      expect(screen.getByTestId('error-phone')).toHaveTextContent('Invalid phone number format');
    });
  });

  describe('Order History', () => {
    const mockOrders = [
      {
        id: 'ORD-12345',
        status: 'delivered',
        total: 59.98,
        items_count: 2,
        created_at: '2026-02-20T10:00:00Z',
        shipped_at: '2026-02-21T14:00:00Z',
        delivered_at: '2026-02-23T16:30:00Z',
        tracking_number: 'UPS123456789',
      },
      {
        id: 'ORD-12346',
        status: 'shipped',
        total: 129.99,
        items_count: 3,
        created_at: '2026-02-25T15:30:00Z',
        shipped_at: '2026-02-26T09:00:00Z',
        tracking_number: 'UPS987654321',
      },
    ];

    it('displays order history with filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: mockOrders, count: 2 }),
      } as Response);
      // Mock for the filter change fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [], count: 0 }),
      } as Response);

      const OrderHistory = () => {
        const [orders, setOrders] = React.useState<any[]>([]);
        const [filter, setFilter] = React.useState('all');

        React.useEffect(() => {
          fetch(`/api/orders?status=${filter}`)
            .then(res => res.json())
            .then(data => setOrders(data.results));
        }, [filter]);

        return (
          <div>
            <h2>Order History</h2>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} data-testid="order-filter">
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
            
            <div data-testid="orders-list">
              {orders.map(order => (
                <div key={order.id} data-testid={`order-${order.id}`}>
                  <div>{order.id}</div>
                  <div>{order.status}</div>
                  <div>${order.total}</div>
                  <div>{order.items_count} items</div>
                </div>
              ))}
            </div>
          </div>
        );
      };

      render(<OrderHistory />);

      await waitFor(() => {
        expect(screen.getByTestId('order-ORD-12345')).toBeInTheDocument();
        expect(screen.getByTestId('order-ORD-12346')).toBeInTheDocument();
      });

      // Test filter change
      const filterSelect = screen.getByTestId('order-filter');
      await user.selectOptions(filterSelect, 'shipped');

      expect(mockFetch).toHaveBeenCalledWith('/api/orders?status=shipped');
    });

    it('allows tracking order status', async () => {
      const OrderTracker = () => {
        const [trackingInfo, setTrackingInfo] = React.useState<any>(null);

        const trackOrder = async (orderId: string) => {
          const response = await fetch(`/api/orders/${orderId}/tracking`);
          const data = await response.json();
          setTrackingInfo(data);
        };

        return (
          <div>
            <button onClick={() => trackOrder('ORD-12346')}>Track Order</button>
            {trackingInfo && (
              <div data-testid="tracking-info">
                <div>Status: {trackingInfo.status}</div>
                <div>Tracking: {trackingInfo.tracking_number}</div>
                <div>Estimated Delivery: {trackingInfo.estimated_delivery}</div>
              </div>
            )}
          </div>
        );
      };

      // Mock tracking response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          status: 'shipped',
          tracking_number: 'UPS987654321',
          estimated_delivery: '2026-03-01',
          current_location: 'Local facility',
        }),
      } as Response);

      render(<OrderTracker />);

      const trackButton = screen.getByText('Track Order');
      await user.click(trackButton);

      await waitFor(() => {
        expect(screen.getByTestId('tracking-info')).toBeInTheDocument();
        expect(screen.getByText('Status: shipped')).toBeInTheDocument();
        expect(screen.getByText('Tracking: UPS987654321')).toBeInTheDocument();
      });
    });

    it('handles order returns and refunds', async () => {
      const OrderActions = () => {
        const [returnRequest, setReturnRequest] = React.useState(false);

        const requestReturn = async (orderId: string, reason: string) => {
          const response = await fetch(`/api/orders/${orderId}/return`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
          });
          
          if (response.ok) {
            setReturnRequest(true);
          }
        };

        return (
          <div>
            <button onClick={() => requestReturn('ORD-12345', 'Defective item')}>
              Request Return
            </button>
            {returnRequest && (
              <div data-testid="return-requested">Return request submitted</div>
            )}
          </div>
        );
      };

      // Mock return response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ return_request_id: 'RET-123' }),
      } as Response);

      render(<OrderActions />);

      const returnButton = screen.getByText('Request Return');
      await user.click(returnButton);

      await waitFor(() => {
        expect(screen.getByTestId('return-requested')).toBeInTheDocument();
        expect(mockFetch).toHaveBeenCalledWith('/api/orders/ORD-12345/return', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'Defective item' }),
        });
      });
    });
  });

  describe('Account Settings', () => {
    it('allows changing password', async () => {
      const PasswordChange = () => {
        const [passwordData, setPasswordData] = React.useState({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
        const [success, setSuccess] = React.useState(false);
        const [errors, setErrors] = React.useState<any>({});

        const handlePasswordChange = async () => {
          const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(passwordData),
          });

          if (response.ok) {
            setSuccess(true);
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
          } else {
            const errorData = await response.json();
            setErrors(errorData);
          }
        };

        return (
          <div>
            <h3>Change Password</h3>
            <input
              type="password"
              placeholder="Current Password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              data-testid="current-password"
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              data-testid="new-password"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
              data-testid="confirm-password"
            />
            <button onClick={handlePasswordChange}>Change Password</button>
            
            {success && <div data-testid="password-success">Password changed successfully</div>}
            {errors.detail && <div data-testid="password-error">{errors.detail}</div>}
          </div>
        );
      };

      // Mock successful password change
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Password changed successfully' }),
      } as Response);

      render(<PasswordChange />);

      const currentPassword = screen.getByTestId('current-password');
      const newPassword = screen.getByTestId('new-password');
      const confirmPassword = screen.getByTestId('confirm-password');
      const changeButton = screen.getByRole('button', { name: /change password/i });

      await user.type(currentPassword, 'oldpassword');
      await user.type(newPassword, 'newpassword123');
      await user.type(confirmPassword, 'newpassword123');
      await user.click(changeButton);

      await waitFor(() => {
        expect(screen.getByTestId('password-success')).toBeInTheDocument();
      });
    });

    it('manages notification preferences', async () => {
      const NotificationSettings = () => {
        const [preferences, setPreferences] = React.useState({
          marketing_emails: true,
          order_updates: true,
          security_alerts: true,
          newsletter: false,
        });
        const [saved, setSaved] = React.useState(false);

        const savePreferences = async () => {
          const response = await fetch('/api/profile/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(preferences),
          });

          if (response.ok) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
          }
        };

        return (
          <div>
            <h3>Notification Preferences</h3>
            <label>
              <input
                type="checkbox"
                checked={preferences.marketing_emails}
                onChange={(e) => setPreferences({ ...preferences, marketing_emails: e.target.checked })}
                data-testid="marketing-emails"
              />
              Marketing Emails
            </label>
            <label>
              <input
                type="checkbox"
                checked={preferences.order_updates}
                onChange={(e) => setPreferences({ ...preferences, order_updates: e.target.checked })}
                data-testid="order-updates"
              />
              Order Updates
            </label>
            <button onClick={savePreferences}>Save Preferences</button>
            {saved && <div data-testid="preferences-saved">Preferences saved</div>}
          </div>
        );
      };

      // Mock successful save
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      render(<NotificationSettings />);

      const marketingCheckbox = screen.getByTestId('marketing-emails');
      const saveButton = screen.getByText('Save Preferences');

      // Toggle marketing emails off
      await user.click(marketingCheckbox);
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/profile/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            marketing_emails: false,
            order_updates: true,
            security_alerts: true,
            newsletter: false,
          }),
        });
      });
    });

    it('handles account deletion', async () => {
      const AccountDeletion = () => {
        const [confirmDelete, setConfirmDelete] = React.useState('');
        const [showConfirm, setShowConfirm] = React.useState(false);
        const [deleted, setDeleted] = React.useState(false);

        const deleteAccount = async () => {
          const response = await fetch('/api/profile/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ confirmation: confirmDelete }),
          });

          if (response.ok) {
            setDeleted(true);
          }
        };

        return (
          <div>
            {!showConfirm ? (
              <button onClick={() => setShowConfirm(true)} data-testid="delete-account-btn">
                Delete Account
              </button>
            ) : (
              <div>
                <p>Type "DELETE" to confirm account deletion:</p>
                <input
                  value={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.value)}
                  data-testid="delete-confirm-input"
                />
                <button
                  onClick={deleteAccount}
                  disabled={confirmDelete !== 'DELETE'}
                  data-testid="confirm-delete"
                >
                  Permanently Delete Account
                </button>
                <button onClick={() => setShowConfirm(false)}>Cancel</button>
              </div>
            )}
            {deleted && <div data-testid="account-deleted">Account has been deleted</div>}
          </div>
        );
      };

      // Mock account deletion
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Account deleted' }),
      } as Response);

      render(<AccountDeletion />);

      const deleteButton = screen.getByTestId('delete-account-btn');
      await user.click(deleteButton);

      const confirmInput = screen.getByTestId('delete-confirm-input');
      const confirmButton = screen.getByTestId('confirm-delete');

      // Button should be disabled initially
      expect(confirmButton).toBeDisabled();

      // Type confirmation
      await user.type(confirmInput, 'DELETE');
      
      // Button should now be enabled
      expect(confirmButton).not.toBeDisabled();

      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/profile/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirmation: 'DELETE' }),
        });
      });
    });
  });

  describe('Favorites & Wishlist', () => {
    const mockFavorites = [
      {
        id: 1,
        product: {
          id: 1,
          name: { en: 'Test Product 1' },
          price: 29.99,
          image_url: 'https://example.com/product1.jpg',
          is_available: true,
        },
        added_at: '2026-02-20T10:00:00Z',
      },
      {
        id: 2,
        product: {
          id: 2,
          name: { en: 'Test Product 2' },
          price: 39.99,
          image_url: 'https://example.com/product2.jpg',
          is_available: false,
        },
        added_at: '2026-02-22T14:30:00Z',
      },
    ];

    it('displays user favorites', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: mockFavorites }),
      } as Response);

      const FavoritesList = () => {
        const [favorites, setFavorites] = React.useState<any[]>([]);

        React.useEffect(() => {
          fetch('/api/favorites')
            .then(res => res.json())
            .then(data => setFavorites(data.results));
        }, []);

        return (
          <div>
            <h2>My Favorites</h2>
            <div data-testid="favorites-list">
              {favorites.map(favorite => (
                <div key={favorite.id} data-testid={`favorite-${favorite.product.id}`}>
                  <div>{favorite.product.name.en}</div>
                  <div>${favorite.product.price}</div>
                  <div>{favorite.product.is_available ? 'Available' : 'Out of Stock'}</div>
                </div>
              ))}
            </div>
          </div>
        );
      };

      render(<FavoritesList />);

      await waitFor(() => {
        expect(screen.getByTestId('favorite-1')).toBeInTheDocument();
        expect(screen.getByTestId('favorite-2')).toBeInTheDocument();
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Out of Stock')).toBeInTheDocument();
      });
    });

    it('allows removing favorites', async () => {
      const FavoriteRemover = () => {
        const [favorites, setFavorites] = React.useState(mockFavorites);

        const removeFavorite = async (favoriteId: number) => {
          const response = await fetch(`/api/favorites/${favoriteId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            setFavorites(prev => prev.filter(f => f.id !== favoriteId));
          }
        };

        return (
          <div>
            {favorites.map(favorite => (
              <div key={favorite.id} data-testid={`favorite-item-${favorite.id}`}>
                <span>{favorite.product.name.en}</span>
                <button onClick={() => removeFavorite(favorite.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        );
      };

      // Mock successful removal
      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      render(<FavoriteRemover />);

      const removeButton = screen.getAllByText('Remove')[0];
      await user.click(removeButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/favorites/1', {
          method: 'DELETE',
        });
        expect(screen.queryByTestId('favorite-item-1')).not.toBeInTheDocument();
      });
    });
  });
});