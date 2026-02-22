import { Cart } from '../entities/cart.entity';

export type TransformedPromocode = {
  title: string;
  type: string;
  itemId: number;
  discount: number;
} | null;

export interface CartData {
  cart: Cart | null;
  amount: number;
  total: string;
}
