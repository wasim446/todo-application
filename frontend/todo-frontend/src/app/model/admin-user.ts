import { Role } from "./role";

export interface AdminUser {

    id: number;
    username: string;
    email: string;
    roles: Role[];
    createdAt: string;


}
