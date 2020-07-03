export class Survey {
    id?: string;
    date?: Date;
    userId?:string;
    userName?: string;
    userImg?: string;
    answers?: [];    
    
    constructor(init?: Partial<Survey>) {
        Object.assign(this, init);
    }
}

export enum SurveyQuestionsUser {
    Overall_Score = 'Selecciona el grado de satisfaccion que represente tu experiencia en nuestro restaurante.',
    Would_Recommend = 'Recomendarias nuestro restarurante a algun conocido?',
    Best_Quality = 'Cual dirias que es nuestra mejor cualidad?',
    Could_Improve = 'Cuales dirias que son los aspectos que debemos mejorar de nuestro restaurante?',
    Comments = 'Quieres contarnos algo?'
}

export enum SurveyQuestionsEmployee {
    Overall_Score = 'Selecciona el grado de satisfaccion que represente tu experiencia en nuestro restaurante.',
    Would_Recommend = 'Recomendarias nuestro restarurante a algun conocido?',
    Best_Quality = 'Cual dirias que es nuestra mejor cualidad?',
    Could_Improve = 'Cuales dirias que son los aspectos que debemos mejorar de nuestro restaurante?',
    Comments = 'Quieres contarnos algo?'
}