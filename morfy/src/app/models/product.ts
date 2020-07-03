export class Product {
    id?: string;
    name?: string;
    description?: string;
    category?: Category[]; // ver
    imageUrl?: string;
    imageUrl1?: string[];
    time?: string;
    price?: number;


  constructor(init?: Partial<Product>) {
    Object.assign(this, init);
  }
}


export enum Category {
  Principal = 'principal',
  Brunch = 'brunch',
  Postre = 'postre',
  Pasta = 'pasta',
  Pizza = 'pizza',
  Bebida = 'bebida',
  Acompañamiento = 'acompañamiento',
  Featured = 'featured'
}
