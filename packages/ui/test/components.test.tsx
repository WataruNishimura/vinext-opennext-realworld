import type { Product } from '@realworld/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button, buttonClasses } from '../src/button.tsx';
import { cn } from '../src/cn.ts';
import { Pagination, paginationRange } from '../src/pagination.tsx';
import { Price } from '../src/price.tsx';
import { ProductCard, ProductGridSkeleton } from '../src/product-card.tsx';
import { productHue } from '../src/product-image.tsx';
import { StarRating, starFills } from '../src/star-rating.tsx';
import { StockBadge } from '../src/stock-badge.tsx';

const product: Product = {
  id: 1,
  slug: 'wireless-headphones',
  name: 'Wireless Headphones',
  description: 'Noise cancelling over-ear headphones.',
  priceCents: 19999,
  brand: 'Sonora',
  featured: true,
  category: { slug: 'audio', name: 'Audio' },
};

describe('cn', () => {
  it('merges conflicting Tailwind classes, last one wins', () => {
    expect(cn('px-2 text-sm', false, 'px-4')).toBe('text-sm px-4');
  });
});

describe('Button', () => {
  it('renders a native button that defaults to type="button"', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveProperty('type', 'button');
  });

  it('shares its classes with links styled as buttons', () => {
    expect(buttonClasses({ variant: 'secondary', size: 'sm' })).toContain('text-sm');
  });
});

describe('Price', () => {
  it('formats cents', () => {
    render(<Price cents={19999} />);
    expect(screen.getByText('$199.99')).toBeDefined();
  });
});

describe('StarRating', () => {
  it('rounds to half stars', () => {
    expect(starFills(3.74)).toEqual(['full', 'full', 'full', 'half', 'empty']);
    expect(starFills(0)).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
    expect(starFills(9)).toEqual(['full', 'full', 'full', 'full', 'full']);
  });

  it('announces the rating as text', () => {
    render(<StarRating rating={4.25} count={12} />);
    expect(screen.getByText('Rated 4.3 out of 5 from 12 reviews')).toBeDefined();
  });
});

describe('StockBadge', () => {
  it('labels each status', () => {
    render(<StockBadge status="low-stock" />);
    expect(screen.getByText('Only a few left')).toBeDefined();
  });
});

describe('ProductCard', () => {
  it('links the product name to its page and shows the price', () => {
    render(<ProductCard product={product} href="/product/1" />);
    expect(screen.getByRole('link', { name: /Wireless Headphones/ }).getAttribute('href')).toBe(
      '/product/1',
    );
    expect(screen.getByText('$199.99')).toBeDefined();
  });

  it('renders the requested number of skeleton cards', () => {
    const { container } = render(<ProductGridSkeleton count={3} />);
    expect(container.querySelectorAll('[data-skeleton="product-card"]')).toHaveLength(3);
  });
});

describe('productHue', () => {
  it('is deterministic per product', () => {
    expect(productHue(7)).toBe(productHue(7));
    expect(productHue(7)).not.toBe(productHue(8));
  });
});

describe('Pagination', () => {
  it('collapses long ranges around the current page', () => {
    expect(paginationRange(1, 3)).toEqual([1, 2, 3]);
    expect(paginationRange(5, 10)).toEqual([1, 'gap', 4, 5, 6, 'gap', 10]);
    expect(paginationRange(1, 10)).toEqual([1, 2, 'gap', 10]);
  });

  it('marks the current page and builds links', () => {
    render(<Pagination page={2} totalPages={3} hrefForPage={page => `/all?page=${page}`} />);
    expect(screen.getByRole('link', { name: 'Page 2' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Next page' }).getAttribute('href')).toBe(
      '/all?page=3',
    );
  });

  it('renders nothing for a single page', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} hrefForPage={page => `/all?page=${page}`} />,
    );
    expect(container.innerHTML).toBe('');
  });
});
