import { AfterViewChecked, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, Subscription } from 'rxjs';
import { SmackMsg } from '../models/models';
import { RabbitMQService } from '../services/rabbitMQ.service';
import { ChatHistoryService } from '../services/chatHistory.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

type uiMsg = SmackMsg & { uiDatetime: Date; uiDisplayName: string };

@Component({
  selector: 'app-chat-ui',
  templateUrl: './chat-ui.component.html',
  styleUrls: ['./chat-ui.component.css'],
})
export class ChatUIComponent implements OnInit, OnDestroy, AfterViewChecked {
  private chatIds = [
    '2fcb7618c37e474fbf998d0fe773806c',
    '61f5596105aa41b1a4edaaae61d4f8bd',
    'ac729983fcef41bfa69a3233ee1dcedd',
  ];
  private uiMsgMap!: Map<string, uiMsg[]>;
  activeChat!: number;
  activeChatMsgs!: uiMsg[];
  chatForm!: FormGroup;
  messageSub$!: Subscription;

  constructor(
    private fb: FormBuilder,
    private chSvc: ChatHistoryService,
    private mqSvc: RabbitMQService,
    private aSvc: AuthService,
    private uSvc: UserService
  ) {}

  ngOnInit(): void {
    this.mqSvc.connect();
    this.chatForm = this.makeForm();
    this.uiMsgMap = new Map<string, uiMsg[]>();
    this.chatIds.forEach((id) => {
      const ida: uiMsg[] = [];
      this.uiMsgMap.set(id, ida);
      this.chSvc.getHistory(id).then((resp) => {
        const sma = resp.data as SmackMsg[];
        sma.forEach((v) => {
          this.insertMsg(v.chatId, v);
        });
      });
    });

    this.activeChat = 0;
    this.activeChatMsgs = this.uiMsgMap.get(this.chatIds[this.activeChat])!;
    this.messageSub$ = this.mqSvc.onReceive.subscribe((msg: SmackMsg) => {
      // console.log('Received msg ' + JSON.stringify(msg));
      this.insertMsg(msg.chatId, msg);
    });
  }

  private msgEquals(u1: uiMsg, u2: uiMsg) {
    return (
      u1.chatId === u2.chatId &&
      u1.creationDatetime === u2.creationDatetime &&
      u1.userEmail === u2.userEmail &&
      u1.message === u2.message &&
      u1.messageType === u2.messageType
    );
  }

  private async insertMsg(cid: string, sm: SmackMsg) {
    const ma = this.uiMsgMap.get(cid)!;
    const msg = this.transform(sm);
    ma.push(this.transform(sm));
  }

  private transform(sm: SmackMsg): uiMsg {
    const u = sm as uiMsg;
    u.uiDatetime = new Date(sm.creationDatetime * 1000);
    this.uSvc.getUserDisplayName(u.userEmail).then((n) => {
      u.uiDisplayName = n;
    });
    return u as uiMsg;
  }

  ngOnDestroy(): void {
    this.messageSub$.unsubscribe();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  toggleActiveChat(ind: number) {
    this.activeChat = ind;
    this.activeChatMsgs = this.uiMsgMap.get(this.chatIds[ind])!;
  }

  makeForm() {
    return this.fb.group({
      messageToSend: this.fb.control<string>('', [Validators.required]),
    });
  }

  async processForm() {
    console.log('processForm is called');
    const msg = this.chatForm.value.messageToSend.trim();
    if (msg.length === 0) {
      this.chatForm = this.makeForm();
      return;
    }
    const msgBody: SmackMsg = {
      chatId: this.chatIds[this.activeChat],
      userEmail: this.aSvc.userEmail,
      messageType: 10,
      message: msg.trim(),
      creationDatetime: Math.ceil(Date.now() / 1000),
    };
    this.mqSvc.publishMsg(msgBody).pipe(map(() => {}));
    this.chatForm = this.makeForm();

    // ACCOUNTING FOR /SPOTIFY MESSAGES
    const msgsplit = msg.split(' ');
    if (msgsplit[0].toLowerCase() === '/spotify' && msgsplit.length > 1) {
      const queryStr = msg.toLowerCase().replace(/^\/spotify /, '');
      const spt = await this.chSvc.spotifySearch(queryStr);
      this.fs(queryStr, spt);
    }
  }

  private fs(queryStr: string, x: any) {
    const data = x.data as any[];
    const ma = this.uiMsgMap.get(this.chatIds[this.activeChat])!;
    const spot2msg = (x: any) => {
      const t = {} as uiMsg;
      t.uiDisplayName = 'SpotifyBot';
      t.messageType = 10;
      t.message =
        x.artists.join(', ') +
        ' - ' +
        [
          x.trackname,
          `<a href="${x.play_url}" target="_blank">Play on Spotify</a>`,
        ].join('\n');
      t.creationDatetime = 1;
      t.uiDatetime = new Date();
      return t;
    };

    if (data.length === 0) {
      ma.push({
        uiDisplayName: 'SpotifyBot',
        message: `No results for ${queryStr}`,
        uiDatetime: new Date(),
      } as uiMsg);
      return;
    }
    data.forEach((x) => {
      ma.push(spot2msg(x));
    });
  }

  public scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }
}
