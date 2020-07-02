import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PreparationsPageRoutingModule } from './preparations-routing.module';

import { PreparationsPage } from './preparations.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PreparationsPageRoutingModule,
    SharedModule
  ],
  declarations: [PreparationsPage]
})
export class PreparationsPageModule {}
