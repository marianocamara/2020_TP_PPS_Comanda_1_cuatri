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
    Overall_Score = 'Selecciona el grado de satisfacción que represente tu experiencia en nuestro restaurante.',
    Would_Recommend = 'Recomendarías nuestro restarurante a algún conocido?',
    Best_Quality = 'Cuál dirías que es nuestra mejor cualidad?',
    Could_Improve = 'Cuales dirías que son los aspectos que debemos mejorar de nuestro restaurante?',
    Comments = 'Quieres contarnos algo?'
}