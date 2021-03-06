import IPreSender from "../../applicationServices/messages/PreSender/IPreSender"
import StorageCreationMessage from "../executers/models/StorageCreationMessage"
import IStorageCreator from "./IStorageCreator"

export default class StorageCreator implements IStorageCreator{
    folderCreationSender: IPreSender
    constructor(folderCreationSender: IPreSender){
        this.folderCreationSender = folderCreationSender
    }

    createStorage(username: string){
        let message = new StorageCreationMessage(username)
        this.folderCreationSender.send(JSON.stringify(message))
    }
}