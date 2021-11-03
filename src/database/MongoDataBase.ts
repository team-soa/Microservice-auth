import User from "../models/User"
import IDataBase from "./IDataBase"

const MongoClient = require('mongodb').MongoClient

export default class MongoDataBase implements IDataBase{
    usersCollection:any
    constructor(connectionString:string){
        MongoClient.connect(connectionString, { useUnifiedTopology: true })
        .then((client:any) => {
          console.log('Connected to Database')
          const db = client.db("users")
          this.usersCollection = db.collection('users')
      }).catch((e:any)=> console.log(e))      
    }
    
    async insertUser(user:User):Promise<boolean>{
      let result = await this.usersCollection.insertOne(user)
      if(result.insertedId ){
        return true
      }else{
        return false
      }
    }

    async getUser(username:string): Promise<User>{
      return await this.usersCollection.findOne({username})
    }

    async updateUser(user:User):Promise<void>{
      let filter = {username: user.username}
      this.usersCollection.updateOne(filter, {"$set":user})
    }
}