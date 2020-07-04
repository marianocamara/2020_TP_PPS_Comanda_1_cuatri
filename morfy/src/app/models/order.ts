import { Product } from './product';

export class Order {
    id?: string;
    date?: Date;
    products?: [{ product: Product, quantity: number, isPrepared: boolean }];
    freeDrink?: boolean;
    freeDessert?: boolean;
    hasDisscount?: boolean;
    idClient?: string;
    table?: string;
    status?: OrderStatus;

  constructor(init?: Partial<Order>) {
    Object.assign(this, init);
  }
}


export enum OrderStatus {
  Pending = 'pending',
  Submitted = 'submitted',
  Confirmed = 'confirmed',
  Ready = 'ready',
  Delivered = 'delivered',
  Received = 'received',
  Paid = 'paid',
  Finished = 'finished'
}
