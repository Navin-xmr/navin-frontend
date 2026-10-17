import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import Pagination from './Pagination';

describe('Pagination', () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('renders pagination controls', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('renders page numbers', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByRole('button', { name: 'Go to page 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to page 2' })).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
          className="custom-class"
        />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('custom-class');
    });
  });

  describe('Page navigation', () => {
    it('calls onPageChange when clicking a page number', async () => {
      const user = userEvent.setup();
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      const page3Button = screen.getByRole('button', { name: 'Go to page 3' });
      await user.click(page3Button);

      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('calls onPageChange when clicking next button', async () => {
      const user = userEvent.setup();
      render(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('calls onPageChange when clicking previous button', async () => {
      const user = userEvent.setup();
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      const prevButton = screen.getByRole('button', { name: /previous/i });
      await user.click(prevButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('does not call onPageChange when clicking current page', async () => {
      const user = userEvent.setup();
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      const currentPageButton = screen.getByRole('button', { name: 'Go to page 3' });
      await user.click(currentPageButton);

      expect(mockOnPageChange).not.toHaveBeenCalled();
    });

    it('navigates through multiple pages sequentially', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      expect(mockOnPageChange).toHaveBeenCalledWith(2);

      rerender(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      await user.click(nextButton);
      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });
  });

  describe('Disabled edges', () => {
    it('disables previous button on first page', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });

    it('disables next button on last page', () => {
      render(
        <Pagination
          currentPage={5}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    it('does not call onPageChange when clicking disabled previous button', async () => {
      const user = userEvent.setup();
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      const prevButton = screen.getByRole('button', { name: /previous/i });
      await user.click(prevButton);

      expect(mockOnPageChange).not.toHaveBeenCalled();
    });

    it('does not call onPageChange when clicking disabled next button', async () => {
      const user = userEvent.setup();
      render(
        <Pagination
          currentPage={5}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(mockOnPageChange).not.toHaveBeenCalled();
    });

    it('enables previous button on page 2', () => {
      render(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).not.toBeDisabled();
    });

    it('enables next button on second-to-last page', () => {
      render(
        <Pagination
          currentPage={4}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('Current page indicator', () => {
    it('highlights current page with aria-current', () => {
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      const currentPageButton = screen.getByRole('button', { name: 'Go to page 3' });
      expect(currentPageButton).toHaveAttribute('aria-current', 'page');
    });

    it('applies active styling to current page', () => {
      render(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      const currentPageButton = screen.getByRole('button', { name: 'Go to page 2' });
      expect(currentPageButton).toHaveClass('bg-[#62ffff]', 'border-[#62ffff]', 'text-black');
    });

    it('does not apply aria-current to non-current pages', () => {
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      const page1Button = screen.getByRole('button', { name: 'Go to page 1' });
      expect(page1Button).not.toHaveAttribute('aria-current');
    });
  });

  describe('Ellipsis rendering', () => {
    it('shows ellipsis for large page counts', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={20}
          onPageChange={mockOnPageChange}
        />
      );

      const ellipses = screen.getAllByText('...');
      expect(ellipses.length).toBeGreaterThan(0);
    });

    it('shows ellipsis when on first page with many total pages', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={15}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to page 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to page 15' })).toBeInTheDocument();
    });

    it('shows ellipsis when on last page with many total pages', () => {
      render(
        <Pagination
          currentPage={15}
          totalPages={15}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to page 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to page 15' })).toBeInTheDocument();
    });

    it('shows two ellipses when on middle page with many total pages', () => {
      render(
        <Pagination
          currentPage={10}
          totalPages={20}
          onPageChange={mockOnPageChange}
        />
      );

      const ellipses = screen.getAllByText('...');
      expect(ellipses).toHaveLength(2);
    });

    it('does not show ellipsis for small page counts', () => {
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });
  });

  describe('Sibling count', () => {
    it('respects custom siblingCount', () => {
      render(
        <Pagination
          currentPage={10}
          totalPages={20}
          onPageChange={mockOnPageChange}
          siblingCount={2}
        />
      );

      // With siblingCount=2, we should see pages 8, 9, 10, 11, 12
      expect(screen.getByRole('button', { name: 'Go to page 8' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to page 9' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to page 10' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to page 11' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to page 12' })).toBeInTheDocument();
    });

    it('uses default siblingCount of 1', () => {
      render(
        <Pagination
          currentPage={10}
          totalPages={20}
          onPageChange={mockOnPageChange}
        />
      );

      // With default siblingCount=1, we should see pages 9, 10, 11
      expect(screen.getByRole('button', { name: 'Go to page 9' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to page 10' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to page 11' })).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles single page', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={1}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Go to page 1' })).toBeInTheDocument();
    });

    it('handles two pages', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={2}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByRole('button', { name: 'Go to page 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to page 2' })).toBeInTheDocument();
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });

    it('first and last pages are always visible', () => {
      render(
        <Pagination
          currentPage={10}
          totalPages={20}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByRole('button', { name: 'Go to page 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to page 20' })).toBeInTheDocument();
    });
  });
});
