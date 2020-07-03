import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GameOnePageRoutingModule } from './game-one-routing.module';

import { GameOnePage } from './game-one.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GameOnePageRoutingModule
  ],
  declarations: [GameOnePage]
})
export class GameOnePageModule {}
