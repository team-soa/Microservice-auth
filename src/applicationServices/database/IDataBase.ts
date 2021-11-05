import User from "../../domainModel/User";

export default interface IDataBase{
    insertUser(user:User):Promise<boolean>
    getUser(username:string): Promise<User>
    updateUser(user:User):Promise<void>
}