export default class User{
    rol: string|undefined
    key: string|undefined
    username: string|undefined
    password: string|undefined
    token: string|undefined
    constructor(username:string, rol:string){
        this.username = username
        this.rol = rol
    }
}