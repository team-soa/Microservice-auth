import User from "../models/User";

export default interface IAuthManager{
    login(username:string, password: string): Promise<User>
    register(username:string, rol: string, password: string): Promise<RegistrationResultEnum>
}