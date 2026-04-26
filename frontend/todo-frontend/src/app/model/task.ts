export interface Task {

    id: number;
    title: string;
    description: string;
    completed: boolean;
    createdBy?: string;
    createdDate: string;
}
