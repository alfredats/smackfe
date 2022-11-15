import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, Subject } from 'rxjs';
import { SmackMsg } from '../models/models';
import {
  AMQPQueue,
  AMQPMessage,
  AMQPWebSocketClient,
  AMQPChannel,
} from '@cloudamqp/amqp-client';
import { AMQPBaseClient } from '@cloudamqp/amqp-client/types/amqp-base-client';
import { environment } from 'src/environments/environment.prod';

@Injectable()
export class RabbitMQService {
  onReceive = new Subject<SmackMsg>();
  exchangeName = 'smack';
  conn!: AMQPBaseClient;
  ch!: AMQPChannel;
  q!: AMQPQueue;

  connect() {
    this.run(this.exchangeName).catch((e) => {
      console.error('ERROR: ', e);
      e.connection.close();
      console.log('Connection closed, reconnecting...');
      setTimeout(this.run, 1000);
    });
  }

  parseMsgBody(msg: AMQPMessage): SmackMsg {
    const msgBody: string = msg.bodyToString()!;
    // console.log('>>> smackMsg:', JSON.parse(msgBody));
    return JSON.parse(msgBody) as SmackMsg;
  }

  publishMsg(msg: SmackMsg): Promise<number> {
    return this.ch.basicPublish(this.exchangeName, '', JSON.stringify(msg), {
      contentType: 'text/plain',
    });
  }

  async run(exchange: string): Promise<void> {
    console.log(
      '>>> ws uri: ' +
        `ws://${environment.wsRelayHost}:${environment.wsRelayPort}`
    );
    const amqp = new AMQPWebSocketClient(
      `ws://${environment.wsRelayHost}:${environment.wsRelayPort}`,
      '/',
      `${environment.rabbitmq_user}`,
      `${environment.rabbitmq_pass}`
    );
    const conn = await amqp.connect();
    console.log('Connecting to rabbitMQ');

    const ch = await conn.channel();
    const ex = await ch.exchangeDeclare(exchange, 'fanout', { durable: false });
    const q = await ch.queue();
    await ch.queueBind(q.name, exchange, '');
    console.log('Awaiting messages');

    this.conn = conn;
    this.ch = ch;
    this.q = q;

    const consumer = await q.subscribe({ noAck: true }, (msg: AMQPMessage) => {
      const newMsg = this.parseMsgBody(msg);
      this.onReceive.next(newMsg);
    });

    await consumer.wait();
  }
}
