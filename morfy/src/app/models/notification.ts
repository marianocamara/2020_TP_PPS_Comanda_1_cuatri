export class Notification {
    senderType?: string;
    message?: NotificationMessages;
    receiverType?: string;
    receiverId?: string;
    date?: Date;


    constructor(init?: Partial<Notification>) {
        Object.assign(this, init);
    }
}

export enum NotificationMessages {
    User_Waiting_Approval = 'Un nuevo usuario espera tu aprobacion.',
    User_Waiting_Table = 'Un cliente nuevo ha ingresado en la lista de espera.',
    New_Order = 'Tienes una nueva orden pendiente.',
    Order_Confirmed = 'Tu pedido fue confirmado por el mozo. Pronto lo recibiras', // para cliente ver si lo usamos
    Order_Ready = 'Hay un pedido listo para entregar', // para el mozo
    Prepare_Dishes = 'Hay platos nuevos por preparar', // para el cocinero
    Prepare_Drinks = 'Hay bebidas nuevas para preparar', // para el bartender
    Item_Prepared = 'Un item esta listo para ser entregado.',
    New_Ticket = 'Un cliente ha realizado una consulta.'
}