export type Account = {
  id: string;
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  zipCode: string | null;
};

export type AccountProfile = Partial<Omit<Account, 'id' | 'email'>>;

/** What the session exposes to the UI: never more than the header and menus need. */
export type SessionAccount = Pick<Account, 'id' | 'name' | 'email'>;
