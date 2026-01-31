import { type DiscountStatusType } from "./fixedDataList";

type Props = {
  sub_total: number;
  type: DiscountStatusType;
  value: number;
};

export default function handleCalcDiscount(props: Props): number {
  let toReturn = 0;

  if (props.type === "fixed") toReturn = props.value;
  else {
    toReturn = (props.value / 100) * props.sub_total;
  }

  return toReturn;
}
