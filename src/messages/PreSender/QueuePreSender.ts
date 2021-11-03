import IQueueSender from "../senders/IQueueSender";
import IPreSender from "./IPreSender";

export default class QueuePreSender implements IPreSender{
    sender:IQueueSender
    queue:string
    constructor(sender:IQueueSender, queue:string){
        this.sender = sender
        this.queue = queue 
    }
    send(data:string):void{
        this.sender.sendDataToQueue(this.queue, data)
    }
}