import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { WaitingListPageRoutingModule } from './waiting-list-routing.module';
import { WaitingListPage } from './waiting-list.page';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    WaitingListPageRoutingModule,
    NgCircleProgressModule.forRoot({
      radius: 95,
      space: -10,
      outerStrokeGradient: true,
      outerStrokeWidth: 10,
      outerStrokeColor: '#ea5d6c',
      outerStrokeGradientStopColor: '#ff7777',
      innerStrokeColor: '#e7e8ea',
      innerStrokeWidth: 10,
      title: 'UI',
      titleFontSize: '39',
      subtitleFontSize: '18',
      animateTitle: false,
      animationDuration: 1000,
      showUnits: false,
      showBackground: false,
      clockwise: false,
      startFromZero: false
    })
  ],
  declarations: [WaitingListPage]
})
export class WaitingListPageModule {}
