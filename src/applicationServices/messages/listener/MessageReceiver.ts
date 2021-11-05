import IMessageExecuter from "../../../domainServices/executers/IMessageExecuter";
import IMessageReceiver from "./IMessageReceiver";

var amqp = require('amqplib/callback_api');

export default class MessageReceiver implements IMessageReceiver{
    host: string
    constructor(host: string){
        this.host = host
    }
    setListener(queue: string, executer: IMessageExecuter): void {
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
                console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
                channel.consume(queue, function(msg:any) {
                    console.log(" [x] Received %s", msg.content.toString());
                    executer.executeMessage(msg.content.toString())
                }, {
                    noAck: true
                });
            });
        });
    }
}
