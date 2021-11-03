import IDataBase from "../../database/IDataBase";
import UserKeyRequest from "../../models/UserKeyRequest";
import UserKeyRequestResponse from "../../models/UserKeyRequestResponse";
import IPreSender from "../PreSender/IPreSender";
import IMessageExecuter from "./IMessageExecuter";

export default class UserKeyMessageExecuter implements IMessageExecuter{
    preSender: IPreSender
    dataBase: IDataBase
    constructor(preSender: IPreSender, dataBase: IDataBase){
        this.preSender = preSender
        this.dataBase = dataBase
    }
    async executeMessage(message: string) {
        let request: UserKeyRequest = JSON.parse(message)
        let user = await this.dataBase.getUser(request.user!)
        user.key
        let response: UserKeyRequestResponse = {songId:request.songId, key:user.key}
        this.preSender.send(JSON.stringify(response))
    }

}