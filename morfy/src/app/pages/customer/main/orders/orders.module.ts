import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrdersPageRoutingModule } from './orders-routing.module';

import { OrdersPage } from './orders.page';
import { OrderDetailsPage } from './order-details/order-details.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgCircleProgressModule } from 'ng-circle-progress';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrdersPageRoutingModule,
    SharedModule,
    NgCircleProgressModule.forRoot({
      radius: 25,
      space: -5,
      outerStrokeGradient: true,
      outerStrokeWidth: 4,
      outerStrokeColor: 'var(--ion-color-success)',
      outerStrokeGradientStopColor: '#40d03e',
      innerStrokeColor: '#e7e8ea',
      innerStrokeWidth: 5,
      animateTitle: false,
      animationDuration: 1000,
      showSubtitle: false,
      showUnits: false,
      showBackground: false,
      clockwise: false,
      startFromZero: false
    })
  ],
  declarations: [OrdersPage, OrderDetailsPage],
  entryComponents: [OrderDetailsPage]
})
export class OrdersPageModule {}
