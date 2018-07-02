import {MatInputModule,MatFormFieldModule, MatExpansionModule, MatListModule, MatDividerModule,MatButtonModule, MatCheckboxModule, MatSidenavModule, MatCardModule, MatIconModule, MatToolbarModule} from '@angular/material';
import {NgModule} from "@angular/core";
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatToolbarModule,
    MatListModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule
  ],
  exports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatToolbarModule,
    MatListModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule
  ],
})
export class AppMaterialModule { }
