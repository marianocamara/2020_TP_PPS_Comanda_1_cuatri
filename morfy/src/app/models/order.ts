import { Product } from './product';

export class Order {
    id?: string;
    date?: Date;
    products?: [{ product: Product, quantity: number }];
    freeDrink?: boolean;
    freeDessert?: boolean;
    hasDisscount?: boolean;
    idClient?: string;
    isComplete?: boolean;

  constructor(init?: Partial<Order>) {
    Object.assign(this, init);
  }
}
