import { Role } from "./role"

export interface UserRoleDTO {

    id: number
    username: string
    email: string
    roles: Role[]
}
