export class Table {
    number?: string;
    commensals?: string;
    type?: string;
    tableStatus?: string;
  constructor(init?: Partial<Table>) {
    Object.assign(this, init);
  }
}
