export default interface IQueueSender{
    sendDataToQueue(queue:string, msg:string): void
}