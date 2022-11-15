export interface SmackMsg {
  chatId: string;
  userEmail: string;
  message: string;
  creationDatetime: number;
  messageType: number;
}

export interface RespMsg {
  code: number;
  message?: string;
  data?: any;
}
