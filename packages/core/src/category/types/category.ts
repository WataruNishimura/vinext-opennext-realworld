export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string;
};

export type CategoryWithCount = Category & { productCount: number };
