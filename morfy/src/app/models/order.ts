import { Product } from './product';

export class Order {
    id?: string;
    products?: Product[];
    freeDrink?: boolean;
    freeDessert?: boolean;
    hasDisscount?: boolean;
    idClient?: string;
    orderStatus?:boolean;

  constructor(init?: Partial<Order>) {
    Object.assign(this, init);
  }
}
