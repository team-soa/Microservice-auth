export interface IAuthenticator{
    obtain_token(username:any, password:any):Promise<string>
    register(username:string, rol: string, password: string): void
}