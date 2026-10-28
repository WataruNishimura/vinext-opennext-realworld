import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AddToCartButton } from '../src/add-to-cart-button.tsx';
import { BackLink } from '../src/back-link.tsx';
import { SaveProductButton } from '../src/save-product-button.tsx';

async function click(element: HTMLElement) {
  await act(() => {
    fireEvent.click(element);
    return Promise.resolve();
  });
}

describe('AddToCartButton', () => {
  it('adds the product and shows the quantity in the cart', async () => {
    const action = vi.fn((_productId: number) =>
      Promise.resolve({ ok: true as const, quantity: 1 }),
    );
    render(<AddToCartButton productId={4} quantity={0} soldOut={false} action={action} />);
    expect(screen.queryByRole('status')).toBeNull();

    await click(screen.getByRole('button', { name: 'Add to cart' }));

    expect(action).toHaveBeenCalledWith(4);
    expect(await screen.findByText('1 in your cart')).toBeDefined();
  });

  it('shows the error the Server Function returns', async () => {
    const action = () => Promise.resolve({ ok: false as const, error: 'Only 2 left.' });
    render(<AddToCartButton productId={4} quantity={2} soldOut={false} action={action} />);
    await click(screen.getByRole('button', { name: 'Add to cart' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Only 2 left.');
  });

  it('cannot add a sold-out product', () => {
    render(
      <AddToCartButton
        productId={7}
        quantity={0}
        soldOut
        action={() => Promise.resolve({ ok: true as const, quantity: 1 })}
      />,
    );
    expect(screen.getByRole('button', { name: 'Sold out' }).hasAttribute('disabled')).toBe(true);
    expect(screen.queryByRole('button', { name: 'Add to cart' })).toBeNull();
  });
});

describe('SaveProductButton', () => {
  it('toggles the saved state through the action', async () => {
    const action = vi.fn((_productId: number) =>
      Promise.resolve({ ok: true as const, saved: true }),
    );
    render(<SaveProductButton productId={2} saved={false} action={action} />);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.getAttribute('aria-pressed')).toBe('false');
    await click(button);
    expect(action).toHaveBeenCalledWith(2);
  });

  it('names the product when it is one of many', () => {
    render(
      <SaveProductButton
        productId={2}
        saved
        label="Desk Lamp"
        action={() => Promise.resolve({ ok: true as const, saved: false })}
      />,
    );
    const button = screen.getByRole('button', { name: 'Save Desk Lamp' });
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.textContent).toBe('Saved');
  });
});

describe('BackLink', () => {
  it('is a plain link to the fallback without earlier in-app history', () => {
    render(<BackLink fallbackHref="/all">← Back</BackLink>);
    expect(screen.getByRole('link', { name: '← Back' }).getAttribute('href')).toBe('/all');
  });
});
