export class Order {
  id?: number;
  // tslint:disable-next-line: variable-name
  discount_amount: number;
  // tslint:disable-next-line: variable-name
  sub_total: number;
  // tslint:disable-next-line: variable-name
  order_amount: number;
  // tslint:disable-next-line: variable-name
  payment_status: string;
  // tslint:disable-next-line: variable-name
  payment_method: string;
  status: string;
  // tslint:disable-next-line: variable-name
  user_id: string;
  // tslint:disable-next-line: variable-name
  created_on?: Date;
  // tslint:disable-next-line: variable-name
  updated_on?: Date;
}
