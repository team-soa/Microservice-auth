import { IAuthenticator } from "../../applicationServices/auth/IAuthenticator";
import IDataBase from "../../applicationServices/database/IDataBase";
import User from "../../domainModel/User";
import IAuthManager from "./IAuthManager";
import IStorageCreator from "../storageCreators/IStorageCreator";
import { RegistrationResultEnum } from "./RegistrationResultEnum";

export class AuthManager implements IAuthManager{
    dataBase: IDataBase
    authenticator: IAuthenticator
    storageCreator: IStorageCreator
    private validator = /^[a-z0-9]+(-[a-z0-9]+)*$/
    constructor(dataBase: IDataBase, authenticator: IAuthenticator, storageCreator: IStorageCreator){
        this.dataBase = dataBase
        this.authenticator = authenticator
        this.storageCreator = storageCreator
    }

    async login(username:string, password: string): Promise<User|undefined>{
        let user  = await this.dataBase.getUser(username)
        if(user){
            let token = await this.authenticator.obtain_token(username, password)
            if (token){
                user.token = token
                return user
            }else{
                return undefined
            }
        }{
            return undefined
        }
    }

    async register(username:string, rol: string, password: string): Promise<RegistrationResultEnum>{
        let user = await this.dataBase.getUser(username);  
        if(user){
            return RegistrationResultEnum.DuplicatedUser
        }else if(!this.isUsernameValid(username)){
            return RegistrationResultEnum.InvalidUsernamme
        }else{
            let user = new User(username, rol)
            this.authenticator.register(username, rol, password)
            let result = await this.dataBase.insertUser(user)
            if(result){
                this.storageCreator.createStorage(username)
                return RegistrationResultEnum.Success
            }else{
                return RegistrationResultEnum.UnknownError
            }
        }
    }

    private isUsernameValid(username: string){
        return this.validator.test(username)
    }
    
}