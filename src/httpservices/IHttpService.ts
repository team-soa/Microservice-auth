export default interface IHttpService{
    request(data:any,options:any,callback:(cbdata:any)=>any): void
}