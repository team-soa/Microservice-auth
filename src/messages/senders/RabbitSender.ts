import IQueueSender from "./IQueueSender";
var amqp = require('amqplib/callback_api');

export default class RabbitSender implements IQueueSender{
    host: string
    constructor(host: string){
        this.host = host
    }
    sendDataToQueue(queue:string, msg:string){
        amqp.connect(this.host, function(error0:any, connection:any) {
            if (error0) {
                throw error0;
            }
            connection.createChannel(function(error1:any, channel:any) {
                if (error1) {
                throw error1;
                }
                
                channel.assertQueue(queue, {
                    durable: false
                });
                channel.sendToQueue(queue, Buffer.from(msg));
                console.log(" [x] Sent %s", msg);
            });
        });
    }
}