import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddUserModalPageRoutingModule } from './add-user-modal-routing.module';

import { AddUserModalPage } from './add-user-modal.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    IonicModule,
    AddUserModalPageRoutingModule,
    SharedModule
  ],
  declarations: [AddUserModalPage]
})
export class AddUserModalPageModule {}
