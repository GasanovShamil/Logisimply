import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AlertService} from "../../services/alert.service";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  hide = true;

  constructor(private alertService : AlertService, private userService : UserService) { }
  registerForm = new FormGroup ({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    lastname: new FormControl('', [Validators.required]),
    firstname: new FormControl('', [Validators.required]),
    activityType: new FormControl('', []),
    categoryType: new FormControl('', []),
    activityEntitled: new FormControl('', [Validators.required]),
    activityStarted: new FormControl('', [Validators.required]),
    siret: new FormControl('', [Validators.required, Validators.maxLength(14), Validators.minLength(14)]),
    address: new FormControl('', [Validators.required]),
    zipCode: new FormControl('', [Validators.required, Validators.maxLength(5), Validators.minLength(5)]),
    town: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),

  });

  ngOnInit() {
  }

  signup () {
    if(this.registerForm.valid){
      this.userService.addUser(JSON.parse(JSON.stringify(this.registerForm.getRawValue()))).subscribe(
        data => {
          this.alertService.success('User created!');
          this.registerForm.reset();
          this.registerForm.clearValidators();
        },
        error => {
          this.alertService.error('ERROR');
        }
      );

    }else{
      this.alertService.error('Please fill up required fields :)');
    }

  }




  // getErrorMessage() {
  //   return this.email.hasError('required') ? 'You must enter a value' :
  //     this.email.hasError('email') ? 'Not a valid email' : '';
  // }

}
