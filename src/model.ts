export interface Thread {
  threadId: number;
}

export interface Participant {
  threadThreadId: number;
  userUserId: number;
}

export interface Message {
  messageId: number;
  sendDate: Date;
  body: string;
  threadThreadId: number;
  userUserId: number;
}

export interface User {
  userId: number;
  userName: string;
}

export interface MessageReadState {
  messageMessageId: number;
  threadThreadId: number;
  userUserId: number;
}
