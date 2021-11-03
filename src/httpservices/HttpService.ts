import IHttpService from "./IHttpService";
import https from 'http';

export default class HttpService implements IHttpService{
    request(data:any,options:any,callback:(cbdata:any)=>any): void{
        const reqs =  https.request(options,  (rest:any) => {
        let s = ""
        rest.on('data',  (d:any) => {
          s += String(d);
                process.stdout.write(d);
            })
            rest.on('end', function () {
              try {
                s=JSON.parse(s.toString())
              } catch (error) { 
              }
                callback(s)
              });
        })
        reqs.on('error', (error:any) => {
            console.log(error)
        })
        reqs.write(data)
        reqs.end()
    }
}