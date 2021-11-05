import User from "../../domainModel/User";
import { RegistrationResultEnum } from "./RegistrationResultEnum";

export default interface IAuthManager{
    login(username:string, password: string): Promise<User|undefined>
    register(username:string, rol: string, password: string): Promise<RegistrationResultEnum>
}