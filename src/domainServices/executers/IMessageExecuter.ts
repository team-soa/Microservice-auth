export default interface IMessageExecuter{
    executeMessage(message: string): Promise<void>
}