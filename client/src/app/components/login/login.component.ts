import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {FormControl, Validators} from '@angular/forms';
import {User} from "../../models/user";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  hide = true;
  user: User = new User();
  constructor(private router: Router, private auth: AuthService) { }

  ngOnInit() {
  }

 /* emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);*/

  login() {
    if(this.user.email == "admin@mail.com" && this.user.password == "admin"){
      localStorage.setItem('isLoggedIn', 'true');
      this.router.navigate(['/']);
    }else{
      localStorage.setItem('isLoggedIn', 'false');
      this.router.navigate(['/']);
    }

  }
}
