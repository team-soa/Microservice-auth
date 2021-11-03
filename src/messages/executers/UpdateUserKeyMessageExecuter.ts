import IDataBase from "../../database/IDataBase";
import User from "../../models/User";
import IMessageExecuter from "./IMessageExecuter";

export default class UpdateUserKeyMessageExecuter implements IMessageExecuter{
    dataBase: IDataBase
    constructor(dataBase: IDataBase){
        this.dataBase = dataBase
    }
    async executeMessage(message: string): Promise<void> {
        try{
            let newUserData: User = JSON.parse(message)
            this.dataBase.updateUser(newUserData)
        }catch(e:any){
            console.log(e)
        }
    }
}