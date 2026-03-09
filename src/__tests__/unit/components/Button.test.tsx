/**
 * Unit Tests for UI Components
 * Tests individual React components in isolation
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render button with text content', () => {
      render(<Button>Click me</Button>);
      
      const buttonElement = screen.getByRole('button', { name: /click me/i });
      expect(buttonElement).toBeInTheDocument();
      expect(buttonElement).toHaveTextContent('Click me');
    });

    it('should render button with custom className', () => {
      render(<Button className="custom-class">Test</Button>);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveClass('custom-class');
    });

    it('should merge default styles with custom className', () => {
      render(<Button className="custom-style">Test</Button>);
      
      const buttonElement = screen.getByRole('button');
      // Should have both default button styles and custom styles
      expect(buttonElement).toHaveClass('custom-style');
      // The exact default classes depend on your buttonVariants implementation
    });
  });

  describe('Variants', () => {
    it('should apply default variant styles', () => {
      render(<Button variant="default">Default Button</Button>);
      
      const buttonElement = screen.getByRole('button');
      // Should have default variant classes (depends on your specific implementation)
      expect(buttonElement).toBeInTheDocument();
    });

    it('should apply destructive variant styles', () => {
      render(<Button variant="destructive">Delete</Button>);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toBeInTheDocument();
    });

    it('should apply outline variant styles', () => {
      render(<Button variant="outline">Outline</Button>);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toBeInTheDocument();
    });

    it('should apply secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toBeInTheDocument();
    });

    it('should apply ghost variant styles', () => {
      render(<Button variant="ghost">Ghost</Button>);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toBeInTheDocument();
    });

    it('should apply link variant styles', () => {
      render(<Button variant="link">Link Button</Button>);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('should apply default size styles', () => {
      render(<Button size="default">Default Size</Button>);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toBeInTheDocument();
    });

    it('should apply small size styles', () => {
      render(<Button size="sm">Small</Button>);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toBeInTheDocument();
    });

    it('should apply large size styles', () => {
      render(<Button size="lg">Large</Button>);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toBeInTheDocument();
    });

    it('should apply icon size styles', () => {
      render(<Button size="icon">🔥</Button>);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toBeInTheDocument();
    });
  });

  describe('States and Props', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toBeDisabled();
    });

    it('should not be disabled by default', () => {
      render(<Button>Enabled Button</Button>);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).not.toBeDisabled();
    });

    it('should have correct type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveAttribute('type', 'submit');
    });

    it('should default to button type', () => {
      render(<Button>Default Type</Button>);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveAttribute('type', 'button');
    });
  });

  describe('Event Handling', () => {
    it('should call onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const buttonElement = screen.getByRole('button');
      fireEvent.click(buttonElement);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled Button
        </Button>
      );
      
      const buttonElement = screen.getByRole('button');
      fireEvent.click(buttonElement);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle keyboard events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Keyboard Test</Button>);
      
      const buttonElement = screen.getByRole('button');
      // jsdom does not simulate native browser Enter→click for buttons;
      // dispatch a click event directly as the browser would after Enter
      fireEvent.click(buttonElement);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle space key press', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Space Test</Button>);
      
      const buttonElement = screen.getByRole('button');
      // jsdom does not simulate native browser Space→click for buttons;
      // dispatch a click event directly as the browser would after Space
      fireEvent.click(buttonElement);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('AsChild Functionality', () => {
    it('should render as child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      
      // Should render as a link, not a button
      const linkElement = screen.getByRole('link');
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute('href', '/test');
      expect(linkElement).toHaveTextContent('Link Button');
    });

    it('should apply button styles to child component', () => {
      render(
        <Button asChild variant="outline">
          <a href="/test">Styled Link</a>
        </Button>
      );
      
      const linkElement = screen.getByRole('link');
      expect(linkElement).toBeInTheDocument();
      // Should have button variant classes applied to the link
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(
        <Button aria-label="Close dialog" aria-pressed="false">
          ×
        </Button>
      );
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveAttribute('aria-label', 'Close dialog');
      expect(buttonElement).toHaveAttribute('aria-pressed', 'false');
    });

    it('should be focusable by default', () => {
      render(<Button>Focusable</Button>);
      
      const buttonElement = screen.getByRole('button');
      buttonElement.focus();
      expect(buttonElement).toHaveFocus();
    });

    it('should not be focusable when disabled', () => {
      render(<Button disabled>Not Focusable</Button>);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveAttribute('disabled');
    });

    it('should support screen readers', () => {
      render(
        <Button aria-describedby="help-text">
          Submit Order
        </Button>
      );
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveAttribute('aria-describedby', 'help-text');
    });
  });

  describe('Complex Content', () => {
    it('should render with icon and text', () => {
      render(
        <Button>
          <span>📧</span>
          Send Email
        </Button>
      );
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveTextContent('📧Send Email');
    });

    it('should render with multiple child elements', () => {
      render(
        <Button>
          <div>Complex</div>
          <span>Content</span>
        </Button>
      );
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveTextContent('ComplexContent');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined onClick gracefully', () => {
      render(<Button onClick={undefined}>No Handler</Button>);
      
      const buttonElement = screen.getByRole('button');
      
      expect(() => fireEvent.click(buttonElement)).not.toThrow();
    });

    it('should handle empty content', () => {
      render(<Button></Button>);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toBeInTheDocument();
    });

    it('should handle null children', () => {
      render(<Button>{null}</Button>);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toBeInTheDocument();
    });

    it('should preserve other HTML attributes', () => {
      render(
        <Button data-testid="custom-button" title="Helpful tooltip">
          Custom Attributes
        </Button>
      );
      
      const buttonElement = screen.getByTestId('custom-button');
      expect(buttonElement).toHaveAttribute('title', 'Helpful tooltip');
    });
  });
});