import { HttpClient, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Subject } from 'rxjs';
import { RespMsg } from '../models/models';
import { Buffer } from 'buffer';
import { environment } from 'src/environments/environment.prod';

@Injectable()
export class AuthService {
  private HOST = `${environment.backendHost}:${environment.backendPort}/auth/`;
  userEmail!: string;
  token!: string;
  tokenObs: Subject<string> = new Subject<string>();

  constructor(private http: HttpClient, private router: Router) {}

  async authenticate({ email, password }: { email: string; password: string }) {
    const token =
      'Basic ' + Buffer.from(email + ':' + password).toString('base64');
    const resp: HttpResponse<RespMsg> = await firstValueFrom(
      this.http.post<RespMsg>(
        this.HOST + 'login',
        {},
        {
          headers: { Authorization: token },
          observe: 'response',
        }
      )
    );

    if (resp.status.valueOf() != HttpStatusCode.Accepted) {
      throw Error(`Failed to authenticate user ${email} with credentials`);
    }
    const tk: string = resp.body?.data.token;
    this.token = tk.split(' ')[1];
    this.tokenObs.next(this.token);
    this.userEmail = email;

    this.router.navigate(['/chat']);
  }

  async signup({
    uuid,
    displayname,
    email,
    password,
  }: {
    uuid: string;
    displayname: string;
    email: string;
    password: string;
  }) {
    const resp: HttpResponse<RespMsg> = await firstValueFrom(
      this.http.put<RespMsg>(
        this.HOST + 'create',
        { uuid, displayname, email, password },
        { observe: 'response' }
      )
    );

    if (resp.status.valueOf() != HttpStatusCode.Created) {
      throw new Error('Failed to create user; Error: ' + resp.body?.message);
    }

    this.router.navigate(['/login']);
  }

  getToken() {
    if (this.token == null) {
      this.router.navigate(['/login']);
    }
    return this.token;
  }

  makeAuthHeaderVal() {
    return `Bearer ${this.getToken()}`;
  }
}
