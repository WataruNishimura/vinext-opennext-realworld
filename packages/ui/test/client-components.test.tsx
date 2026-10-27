import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from '../src/modal.tsx';
import { QuantityStepper } from '../src/quantity-stepper.tsx';

describe('QuantityStepper', () => {
  it('calls the action with the next quantity', async () => {
    const action = vi.fn(() => Promise.resolve());
    render(<QuantityStepper label="Wireless Headphones" quantity={2} max={10} action={action} />);

    await act(() => {
      fireEvent.click(
        screen.getByRole('button', { name: 'Increase quantity of Wireless Headphones' }),
      );
      return Promise.resolve();
    });

    expect(action).toHaveBeenCalledWith(3);
  });

  it('disables the buttons at the limits', () => {
    render(<QuantityStepper label="Mat" quantity={1} max={1} action={() => Promise.resolve()} />);
    expect(
      screen.getByRole('button', { name: 'Decrease quantity of Mat' }).hasAttribute('disabled'),
    ).toBe(true);
    expect(
      screen.getByRole('button', { name: 'Increase quantity of Mat' }).hasAttribute('disabled'),
    ).toBe(true);
  });

  it('announces the current quantity', () => {
    render(<QuantityStepper label="Mat" quantity={4} max={10} action={() => Promise.resolve()} />);
    expect(screen.getByRole('status').textContent).toBe('4');
  });
});

describe('Modal', () => {
  it('renders a native dialog named by its title', () => {
    render(
      <Modal open title="Quick view" onClose={() => undefined}>
        <p>Body</p>
      </Modal>,
    );
    const dialog = document.querySelector('dialog');
    expect(dialog?.getAttribute('aria-labelledby')).toBe(
      screen.getByRole('heading', { name: 'Quick view' }).id,
    );
  });

  it('reports a close from the dialog', () => {
    const onClose = vi.fn();
    render(
      <Modal open title="Quick view" onClose={onClose}>
        <p>Body</p>
      </Modal>,
    );
    const dialog = document.querySelector('dialog');
    if (!dialog) throw new Error('Expected a dialog');
    fireEvent(dialog, new Event('close'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
