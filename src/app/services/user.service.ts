import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { RespMsg } from '../models/models';
import { AuthService } from './auth.service';

@Injectable()
export class UserService {
  private HOST: string = `${environment.backendHost}:${environment.backendPort}/users/name`;
  private displaynames: Map<string, string> = new Map<string, string>();

  constructor(private http: HttpClient, private aSvc: AuthService) {}

  public getUserDisplayName(userEmail: string): Promise<string> {
    if (this.displaynames.get(userEmail) != null) {
      return Promise.resolve(this.displaynames.get(userEmail)!);
    }
    return firstValueFrom(
      this.http
        .get<RespMsg>(`${this.HOST}/${userEmail}`, {
          headers: { Authorization: `${this.aSvc.makeAuthHeaderVal()}` },
        })
        .pipe(
          map((v) => {
            this.displaynames.set(userEmail, v.data.displayname);
            return v.data.displayname;
          })
        )
    );
  }
}
