import type { ProductDetails as ProductDetailsData, ProductPage, Review } from '@realworld/core';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CartIconLink } from '../src/cart-link.tsx';
import { CatalogLayout } from '../src/catalog-layout.tsx';
import { CategoryNav } from '../src/category-nav.tsx';
import { LiveStock } from '../src/live-stock.tsx';
import { ProductDetails } from '../src/product-details.tsx';
import { ProductHeader } from '../src/product-header.tsx';
import { ProductPageLayout } from '../src/product-page-layout.tsx';
import { ProductResults } from '../src/product-results.tsx';
import { ProductSearchForm } from '../src/product-search-form.tsx';
import { ReviewList } from '../src/review-list.tsx';
import { SignInToSaveLink } from '../src/save-product.tsx';
import { SiteFooter } from '../src/site-footer.tsx';
import { SiteHeader } from '../src/site-header.tsx';
import { SortLinks } from '../src/sort-links.tsx';
import { MarketingShell, StoreShell } from '../src/store-shell.tsx';

const details: ProductDetailsData = {
  id: 7,
  slug: 'ergonomic-mouse',
  name: 'Ergonomic Mouse',
  description: 'Vertical wireless mouse.',
  priceCents: 8999,
  brand: 'Keystone',
  featured: false,
  category: { slug: 'electronics', name: 'Electronics' },
  sku: 'RW-0007',
  materials: null,
  origin: 'Taiwan',
  warranty: '2 years',
};

describe('SiteHeader', () => {
  it('links home and to the catalog, with the account and cart slots', () => {
    render(<SiteHeader account={<span>account</span>} cart={<span>cart</span>} />);
    const main = screen.getByRole('navigation', { name: 'Main' });
    expect(within(main).getByRole('link', { name: 'Products' }).getAttribute('href')).toBe('/all');
    expect(screen.getByRole('link', { name: 'RealWorld' }).getAttribute('href')).toBe('/');
    expect(screen.getByText('account')).toBeDefined();
    expect(screen.getByText('cart')).toBeDefined();
  });
});

describe('SiteFooter', () => {
  it('names the runtime that rendered the page', () => {
    render(<SiteFooter runtime="vinext" />);
    expect(screen.getByTestId('runtime-name').textContent).toBe('vinext');
  });
});

describe('StoreShell', () => {
  it('puts the page in the main landmark between header and footer', () => {
    render(
      <StoreShell account={null} cart={null} runtime="OpenNext">
        <h1>Page</h1>
      </StoreShell>,
    );
    expect(within(screen.getByRole('main')).getByRole('heading', { name: 'Page' })).toBeDefined();
    expect(screen.getByRole('banner')).toBeDefined();
    expect(screen.getByRole('contentinfo')).toBeDefined();
  });
});

describe('MarketingShell', () => {
  it('keeps the header static: no session reads, plain account and cart links', () => {
    render(
      <MarketingShell runtime="vinext">
        <h1>About</h1>
      </MarketingShell>,
    );
    expect(screen.getByRole('link', { name: 'Account' }).getAttribute('href')).toBe('/account');
    expect(screen.getByRole('link', { name: 'Cart' }).getAttribute('href')).toBe('/cart');
    expect(within(screen.getByRole('main')).getByRole('heading', { name: 'About' })).toBeDefined();
  });
});

describe('CartIconLink', () => {
  it('names the item count and hides an empty badge', () => {
    const { rerender } = render(<CartIconLink count={0} />);
    expect(screen.getByRole('link', { name: 'Cart with 0 items' }).textContent).toBe('Cart');
    rerender(<CartIconLink count={1} />);
    expect(screen.getByRole('link', { name: 'Cart with 1 item' }).textContent).toBe('Cart1');
    rerender(<CartIconLink />);
    expect(screen.getByRole('link', { name: 'Cart' })).toBeDefined();
  });
});

describe('CategoryNav', () => {
  it('links every category and marks the active one', () => {
    render(
      <CategoryNav
        categories={[
          { slug: 'audio', name: 'Audio' },
          { slug: 'home', name: 'Home' },
        ]}
        active="audio"
        hrefFor={slug => (slug ? `/all?category=${slug}` : '/all')}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Categories' });
    expect(within(nav).getByRole('link', { name: 'All' }).getAttribute('href')).toBe('/all');
    expect(within(nav).getByRole('link', { name: 'Audio' }).getAttribute('aria-current')).toBe(
      'page',
    );
    expect(within(nav).getByRole('link', { name: 'Home' }).hasAttribute('aria-current')).toBe(
      false,
    );
  });
});

describe('ProductSearchForm', () => {
  it('is a GET form to the catalog that keeps the category and a non-default sort', () => {
    const { container } = render(
      <ProductSearchForm
        search={{ query: 'desk', category: 'home', sort: 'price-desc', page: 3 }}
      />,
    );
    const form = container.querySelector('form');
    expect(form?.getAttribute('action')).toBe('/all');
    expect(form?.getAttribute('method')).toBe('get');
    expect(screen.getByRole('searchbox', { name: 'Search products' })).toHaveProperty(
      'value',
      'desk',
    );
    const hidden = [...container.querySelectorAll('input[type="hidden"]')].map(input => [
      input.getAttribute('name'),
      input.getAttribute('value'),
    ]);
    expect(hidden).toEqual([
      ['category', 'home'],
      ['sort', 'price-desc'],
    ]);
    expect(screen.getByRole('button', { name: 'Search' })).toBeDefined();
  });
});

describe('SortLinks', () => {
  it('links each sort and marks the current one', () => {
    render(
      <SortLinks
        search={{ query: '', category: null, sort: 'price-asc', page: 1 }}
        hrefFor={sort => `/all?sort=${sort}`}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Sort products' });
    expect(within(nav).getAllByRole('link')).toHaveLength(4);
    expect(
      within(nav).getByRole('link', { name: 'Price: low to high' }).getAttribute('aria-current'),
    ).toBe('true');
  });
});

describe('CatalogLayout', () => {
  it('places the filters beside the toolbar and results', () => {
    render(
      <CatalogLayout filters={<p>filters</p>} toolbar={<p>toolbar</p>}>
        <p>results</p>
      </CatalogLayout>,
    );
    expect(screen.getByText('filters').closest('aside')).not.toBeNull();
    expect(screen.getByText('toolbar')).toBeDefined();
    expect(screen.getByText('results')).toBeDefined();
  });
});

describe('ProductResults', () => {
  const page: ProductPage = {
    products: [details],
    total: 1,
    page: 1,
    pageSize: 9,
    totalPages: 1,
  };

  it('shows the count, the cards and each card slot', () => {
    render(
      <ProductResults
        page={page}
        hrefForPage={n => `/all?page=${n}`}
        slot={product => <span>badge {product.id}</span>}
      />,
    );
    expect(screen.getByText('1 product')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Ergonomic Mouse' })).toBeDefined();
    expect(screen.getByText('badge 7')).toBeDefined();
  });

  it('says when nothing matches', () => {
    render(
      <ProductResults page={{ ...page, products: [], total: 0 }} hrefForPage={() => '/all'} />,
    );
    expect(screen.getByText('No products match your search.')).toBeDefined();
  });
});

describe('ProductHeader', () => {
  it('shows the category, brand, name, rating and price', () => {
    render(<ProductHeader product={details} summary={{ count: 6, average: 4 }} />);
    expect(screen.getByText('Electronics · Keystone')).toBeDefined();
    expect(screen.getByRole('heading', { level: 1, name: 'Ergonomic Mouse' })).toBeDefined();
    expect(screen.getByText('4.0 (6)')).toBeDefined();
    expect(screen.getByText('$89.99')).toBeDefined();
  });

  it('says when there are no reviews yet', () => {
    render(<ProductHeader product={details} summary={{ count: 0, average: 0 }} />);
    expect(screen.getByText('No reviews yet')).toBeDefined();
  });
});

describe('ProductDetails', () => {
  it('lists the details the product has', () => {
    render(<ProductDetails product={details} />);
    expect(screen.getByRole('heading', { name: 'Product Details' })).toBeDefined();
    const terms = [...document.querySelectorAll('dt')].map(term => term.textContent);
    expect(terms).toEqual(['SKU', 'Origin', 'Warranty']);
  });
});

describe('LiveStock', () => {
  it('shows the exact stock or that it is out of stock', () => {
    const { rerender } = render(<LiveStock stock={3} />);
    expect(screen.getByTestId('live-stock').textContent).toBe('3 in stock');
    rerender(<LiveStock stock={0} />);
    expect(screen.getByTestId('live-stock').textContent).toBe('Out of stock');
  });
});

describe('ReviewList', () => {
  const review: Review = {
    id: 1,
    productId: 7,
    authorName: 'Omar R.',
    rating: 5,
    title: 'Exceeded expectations',
    body: 'Great.',
    createdAt: '2026-03-02T10:00:00.000Z',
  };

  it('shows each review with its author and date', () => {
    render(<ReviewList reviews={[review]} />);
    expect(screen.getByRole('heading', { name: 'Exceeded expectations' })).toBeDefined();
    const time = screen.getByText('Mar 2, 2026');
    expect(time.tagName).toBe('TIME');
    expect(time.getAttribute('datetime')).toBe(review.createdAt);
  });

  it('says when there are no reviews', () => {
    render(<ReviewList reviews={[]} />);
    expect(screen.getByText('No reviews yet for this product.')).toBeDefined();
  });
});

describe('ProductPageLayout', () => {
  it('lays out the product slots and the reviews section', () => {
    render(
      <ProductPageLayout
        back={<a href="/all">Back</a>}
        header={<h1>Name</h1>}
        stock={<p>stock</p>}
        actions={<button type="button">Add</button>}
        details={<p>details</p>}
        reviews={<p>reviews</p>}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Customer reviews' })).toBeDefined();
    for (const text of ['stock', 'details', 'reviews'])
      expect(screen.getByText(text)).toBeDefined();
  });
});

describe('SignInToSaveLink', () => {
  it('returns to the product after signing in', () => {
    render(<SignInToSaveLink productId={7} />);
    expect(screen.getByRole('link', { name: 'Sign in to save' }).getAttribute('href')).toBe(
      '/sign-in?redirectTo=%2Fproduct%2F7',
    );
  });
});
