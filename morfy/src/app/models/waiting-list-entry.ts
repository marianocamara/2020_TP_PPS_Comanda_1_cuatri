export class WaitingListEntry {
    id?: string;
    customerImg?: string;
    customerName?: string;
    date: Date;


  constructor(init?: Partial<WaitingListEntry>) {
    Object.assign(this, init);
  }
}
