export class User {
    email?: string;
    name?: string;
    lastName?:string;
    id?: string;
    imageUrl?: string;
    type?: string;
    dni?:string;
    cuil?:string;
    approved?:boolean;
    table?: string;
    status?:Status;


  constructor(init?: Partial<User>) {
    Object.assign(this, init);
  }
}

export enum Status {
  Recent_Enter = 'recent_enter',
  Waiting_Table = 'waiting_table',
  Recent_Sit = 'recent_sit',
  Preparing_Order = 'preparing_order',
  Waiting_Order = 'waiting_order',
  Eating = 'eating',
  Waiting_Account = 'waiting_account',
  Already_Paid = 'already_paid'
}