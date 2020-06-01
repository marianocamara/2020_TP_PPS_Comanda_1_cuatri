export class Product {
    id?: string;
    name?: string;
    description?:string;
    imageUrl?: string[];
    time?: string;
    price?: string;


  constructor(init?: Partial<Product>) {
    Object.assign(this, init);
  }
}
