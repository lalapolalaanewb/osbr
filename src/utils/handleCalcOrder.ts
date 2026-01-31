import type { OrderType } from "../types/order";
import handleCalcDiscount from "./handleCalcDiscount";

export default function handleCalcOrder(
  props: Pick<OrderType, "discounts" | "items">,
): Pick<OrderType, "sub_total" | "total"> {
  let sub_total = 0;
  let discount = 0;
  let total = 0;

  props.items.forEach((item) => {
    let itemDiscount = 0;

    item.discounts?.forEach((item2) => {
      itemDiscount += handleCalcDiscount({
        sub_total: item.price,
        type: item2.type,
        value: item2.amount,
      });
    });

    sub_total += (item.price - itemDiscount) * item.quantity;
  });

  props.discounts?.forEach((item) => {
    discount += handleCalcDiscount({
      sub_total,
      type: item.type,
      value: item.amount,
    });
  });

  total = sub_total - discount;

  return {
    sub_total,
    total,
  };
}
