export class Chat {
    id?: string;
    date?: Date;
    clientName?: string;
    clientTable?: number;
    clientImg?: string;
    messages?: [{        
        createdAt?: string,
        senderId?: string,
        senderName?: string,
        messageBody?: string,
    }];    
    msgCount?: number;
    
    constructor(init?: Partial<Chat>) {
        Object.assign(this, init);
    }
}