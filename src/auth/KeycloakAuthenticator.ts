import IHttpService from "../httpservices/IHttpService"
import { IAuthenticator } from "./IAuthenticator"
import qs from 'qs'

export default class KeycloakAuthenticator implements IAuthenticator{
  httpService:IHttpService
  constructor(httpService:IHttpService){
    this.httpService = httpService
  }
  get_admin_token (callback: (token:string)=>void){
    let data1 =  {
        grant_type:"password",
        client_id:"karaoke-client",
        client_secret:"ba2939cf-e64c-4706-b578-349675e249b4",
        username:"creator",
        password:"creator1"
      }
    let data=qs.stringify(data1)
      
    const options = {
    hostname: '168.62.39.210',
    port: 8080,
    path: '/auth/realms/Karaoke-Realm/protocol/openid-connect/token',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    }
    }
    this.httpService.request(data,options,function(d){
      callback(d.access_token)
    })
    
  }
      
  create_user(username:string,token:string,callback:(d:any)=>void){
    let data =  JSON.stringify({
        enabled:"true", username
      })
    const options = {
    hostname: '168.62.39.210',
    port: 8080,
    path: '/auth/admin/realms/Karaoke-Realm/users',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization':'Bearer '+token
    }
    }
    this.httpService.request(data,options,function(d:any){
      callback(d)
    })
  }
      
  get_userid(username:string,token:string,callback:(d:any)=>void){
    let data =  {}
    data= JSON.stringify(data)
    const options = {
        hostname: '168.62.39.210',
        port: 8080,
        path: '/auth/admin/realms/Karaoke-Realm/users?username='+username,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':'Bearer '+token
        }
    }
    this.httpService.request(data,options,function(d){
      callback(d[0].id)
    })
  }
      
  set_rol(userid:string,rol:string,token:string,callback:(d:any)=>void){
    let data:{}[] = []
    if (rol =="user") {
        data =  [{
            id:"ee18091d-08be-484e-b7d5-220f4b0a39ed", name:"user_role"
          }]
    }else if (rol == "premium"){
        data =  [{
            id:"6eb321be-8f72-4b1b-8a8c-29c8ea6d84b1", name:"premium-role"
          }]
    }
  
    let data2 = JSON.stringify(data)
    const options = {
    hostname: '168.62.39.210',
    port: 8080,
    path: '/auth/admin/realms/Karaoke-Realm/users/'+ userid+'/role-mappings/realm',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization':'Bearer '+token
    }
    }
    
    this.httpService.request(data2,options,function(d){
      callback(d)
    })
  }
      
  set_password(userid:string,password:string,token:string,callback:(d:any)=>void){
  
    let data =  JSON.stringify({ type: "password", temporary: false, value: password })

    const options = {
    hostname: '168.62.39.210',
    port: 8080,
    path: '/auth/admin/realms/Karaoke-Realm/users/'+ userid+'/reset-password',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization':'Bearer '+token
    }
    }
    
    this.httpService.request(data,options,function(d){
      callback(d)
    })
  }
  
  async obtain_token(username:any, password:any):Promise<string>{
    let data1 =  {
      grant_type:"password",
      client_id:"karaoke-client",
      client_secret:"ba2939cf-e64c-4706-b578-349675e249b4",
      username,
      password
    }
    let data=qs.stringify(data1)
    const options = {
      hostname: '168.62.39.210',
      port: 8080,
      path: '/auth/realms/Karaoke-Realm/protocol/openid-connect/token',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
      }
    }
    const response:any = await new Promise(resolve => this.httpService.request(data,options, resolve));
    return response.access_token
  }

  register(username:string, rol: string, password: string): void{
    let current = this
    current.get_admin_token(function(token){
      current.create_user(username,token,function(rest:any){
        current.get_userid(username,token,function(userid:any){
          current.set_rol(userid,rol,token,function(a:any){})
            current.set_password(userid,password,token,function(b:any){
              })
          })
      })
    })
  }
}