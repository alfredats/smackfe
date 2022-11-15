import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RespMsg } from '../models/models';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment.prod';

@Injectable()
export class ChatHistoryService {
  private HOST: string = `${environment.backendHost}:${environment.backendPort}`;

  constructor(private http: HttpClient, private aSvc: AuthService) {}

  public getHistory(chatID: string, ...args: number[]): Promise<RespMsg> {
    const pageNum = args.length != 0 ? args[0].toString() : '';

    return firstValueFrom(
      this.http.get<RespMsg>(`${this.HOST}/messages/${chatID}/${pageNum}`, {
        headers: { Authorization: `${this.aSvc.makeAuthHeaderVal()}` },
      })
    );
  }

  public spotifySearch(q: string) {
    const qenc = encodeURIComponent(q);
    return firstValueFrom(
      this.http.get<RespMsg>(`${this.HOST}/spotify?q=${qenc}`, {
        headers: { Authorization: `${this.aSvc.makeAuthHeaderVal()}` },
      })
    );
  }
}
