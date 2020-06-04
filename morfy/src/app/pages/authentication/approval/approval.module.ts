import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApprovalPageRoutingModule } from './approval-routing.module';

import { ApprovalPage } from './approval.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApprovalPageRoutingModule
  ],
  declarations: [ApprovalPage]
})
export class ApprovalPageModule {}
