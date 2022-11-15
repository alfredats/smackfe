import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login.component';
import { ChatUIComponent } from './components/chat-ui.component';
import { SignupComponent } from './components/signup.component';
import { HeaderComponent } from './components/header.component';
import { RabbitMQService } from './services/rabbitMQ.service';
import { AuthService } from './services/auth.service';
import { ChatHistoryService } from './services/chatHistory.service';
import { UserService } from './services/user.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ChatUIComponent,
    SignupComponent,
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [AuthService, RabbitMQService, ChatHistoryService, UserService],
  bootstrap: [AppComponent],
})
export class AppModule {}
