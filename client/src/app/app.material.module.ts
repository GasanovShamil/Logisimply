import {
  MatInputModule, MatFormFieldModule, MatExpansionModule, MatListModule, MatDividerModule, MatButtonModule,
  MatCheckboxModule, MatSidenavModule, MatCardModule, MatIconModule, MatToolbarModule, MatSelectModule,
  MatSnackBarModule, MatDatepickerModule, MatNativeDateModule, MatTableModule, MatPaginatorModule, MatTabsModule,
  MatProgressSpinnerModule, MatSortModule, MatTooltipModule
} from '@angular/material';
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
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTooltipModule
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
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTooltipModule
  ],
})
export class AppMaterialModule { }
