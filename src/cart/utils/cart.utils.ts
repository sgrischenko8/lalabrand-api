import { Cart } from '../entities/cart.entity';

export function getTotalAndAmount(cart: Cart): {
  total: string;
  amount: number;
} {
  if (cart?.cart_items) {
    let amount = 0;
    let total = 0;

    total = cart.cart_items.reduce((acc, item) => {
      if (!item.bundle_id) {
        amount += Number(item.amount);

        const price = parseFloat(String(item.product_id.price));

        acc += Number(item.amount) * Number(price);
      }

      return acc;
    }, 0);

    return { total: total.toFixed(2), amount };
  } else return { total: '0.00', amount: 0 };
}
