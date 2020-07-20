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
  Waiting_Table = 'waiting_table'
}