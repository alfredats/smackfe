import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  // NOTE: GENERATE UUID HERE, INSERT INTO SIGNUP FORM!

  form!: FormGroup;

  constructor(private fb: FormBuilder, private aSvc: AuthService) {}

  ngOnInit(): void {
    this.form = this.makeForm();
  }

  private makeForm() {
    const uuid = uuidv4().replace(/[-]/g, '');
    return this.fb.group({
      uuid: this.fb.control<string>(uuid, [Validators.required]),
      displayname: this.fb.control<string>('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(15),
      ]),
      email: this.fb.control<string>('', [
        Validators.required,
        Validators.email,
      ]),
      password: this.fb.control<string>('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(16),
      ]),
    });
  }

  processForm() {
    this.aSvc
      .signup(this.form.value)
      .then(() => {
        window.alert('Signed up successfully!');
      })
      .catch((e: Error) => {
        window.alert(e.message);
      });
  }
}
