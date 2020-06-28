export class Notification {
    senderType?: string;
    message?: NotificationMessages;
    receiverType?: string;
    date?: Date;
    
    
    constructor(init?: Partial<Notification>) {
        Object.assign(this, init);
    }
}

export enum NotificationMessages {
    User_Waiting_Approval = 'Un nuevo usuario espera tu aprobacion.',
    User_Waiting_Table = 'Un cliente nuevo ha ingresado en la lista de espera.',
    New_Order = 'Tienes una nueva orden pendiente.',
    Item_Prepared = 'Un item esta listo para ser entregado.',
    New_Ticket = 'Un cliente ha realizado una consulta.'
}