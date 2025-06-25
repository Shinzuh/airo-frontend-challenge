import {CsvData} from './csv-data.model';

export interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    subscription: SubscriptionType;
    password: string;
    csvData: CsvData[];
    csvFile: File | null;
}

export enum SubscriptionType {
    BASIC = 'Basic',
    ADVANCED = 'Advanced',
    PRO = 'Pro'
}
