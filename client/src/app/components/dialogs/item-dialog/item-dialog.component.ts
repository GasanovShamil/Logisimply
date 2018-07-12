import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef, MatSlideToggleChange} from "@angular/material";
import {DataService} from "../../../services/data.service";
import {TranslateService} from "@ngx-translate/core";
import {AlertService} from "../../../services/alert.service";
import {CustomerDialogComponent} from "../customer-dialog/customer-dialog.component";

@Component({
  selector: 'app-item-dialog',
  templateUrl: './item-dialog.component.html',
  styleUrls: ['./item-dialog.component.css']
})
export class ItemDialogComponent implements OnInit {
  saveButton: boolean = (this.data)?false:true;
  editLablePosition = 'before';
  itemForm: FormGroup;
  editMode: boolean = false;
  close: boolean = false;

  types = [{
    "name": "dataSelect.product",
    "value": "product"
  },
    {
      "name": "dataSelect.service",
      "value": "service"
    }];

  constructor(private alertService: AlertService,
              private dataService: DataService,
              public translate: TranslateService,
              public dialogRef: MatDialogRef<CustomerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCloseClick(): void {
    this.close = true;
    this.dialogRef.close();
  }


  saveData(){
    console.log('SAVE CLICK');
    if(!this.close) {
      if (this.itemForm.valid) {
        if (this.editMode) {
          this.dataService.updateItem(this.itemForm.getRawValue()).subscribe(
            data => this.dialogRef.close({data: data.data, message: data.message, editMode: this.editMode}),
            error => this.alertService.error(error.error.message)
          )
        } else {
          this.dataService.addItem(this.itemForm.getRawValue()).subscribe(
            data => this.dialogRef.close(data),
            error => this.alertService.error(error.error.message)
          )
        }
      } else {
        this.translate.get(['contactsDialog']).subscribe(translation => {
          let errorMessage = translation.contactsDialog.contacts_form_error_message;
          this.alertService.error(errorMessage);
        })
      }
    }
  }

  ngOnInit(): void {
    this.setFormGroup();
  }

  onSelectChange(element: string){
    this.itemForm.controls['type'].setValue(element);
  }

  editSliderChange(event: MatSlideToggleChange) {
    if (event.checked){
      this.itemForm.enable();
      this.saveButton = true;
      this.editMode = true;
    }else{
      this.itemForm.disable();
      this.saveButton = false;
      this.editMode = false;
      this.setFormGroup();
    }
  }

  setFormGroup(){
    if(this.data){
      this.saveButton = false;
      this.itemForm = new FormGroup({
        type: new FormControl({value: this.data.type, disabled: true}, [Validators.required]),
        reference: new FormControl({value: this.data.reference, disabled: true}, [Validators.required]),
        label: new FormControl({value: this.data.label, disabled: true}, [Validators.required]),
        priceET: new FormControl({value: this.data.priceET, disabled: true}, [Validators.required, Validators.pattern('[+-]?([0-9]*[.])?[0-9]+')]),
        description: new FormControl({value: this.data.description, disabled: true}, [Validators.required])
      });
    } else {
      this.itemForm = new FormGroup({
        type: new FormControl({value: 'product', disabled: false}, [Validators.required]),
        reference: new FormControl('', [Validators.required]),
        label: new FormControl('', [Validators.required]),
        priceET: new FormControl('', [Validators.required,Validators.pattern('[+-]?([0-9]*[.])?[0-9]+')]),
        description: new FormControl('', [Validators.required])
      });
    }
  }
}

