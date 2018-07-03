import { Component, OnInit } from '@angular/core';
import {AlertService} from "../../services/alert.service";
import {MatSnackBar} from "@angular/material";

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {

  message: any;

  constructor(private alertService: AlertService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.alertService.getMessage().subscribe(message => {
      if(message){
        this.snackBar.open(message.text, 'OK', {
          duration: 5000,
          announcementMessage : "hello"
        });
        // this.message = message;
      }
    });
  }

}
