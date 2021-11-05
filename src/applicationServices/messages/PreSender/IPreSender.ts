import IQueueSender from "../senders/IQueueSender";

export default interface IPreSender{
    sender:IQueueSender
    send(data:string):void
}