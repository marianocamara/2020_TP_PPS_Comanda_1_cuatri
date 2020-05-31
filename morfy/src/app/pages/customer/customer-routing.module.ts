import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerPage } from './customer.page';

const routes: Routes = [
  {
//     path: '',
//     component: CustomerPage
//   },
//   {
//     path: 'orders',
//     loadChildren: () => import('./orders/orders.module').then( m => m.OrdersPageModule)
//   },
//   {
//     path: 'home',
//     loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
//   },
//   {
//     path: 'more',
//     loadChildren: () => import('./more/more.module').then( m => m.MorePageModule)
//   }

// ];

      path: '',
      component: CustomerPage,
      children: [
        {
          path: 'home',
          children: [
            {
              path: '',
              loadChildren: () =>
                import('./home/home.module').then(m => m.HomePageModule)
            }
          ]
        },
        {
          path: 'orders',
          children: [
            {
              path: '',
              loadChildren: () =>
                import('./orders/orders.module').then(m => m.OrdersPageModule)
            }
          ]
        },
        {
          path: 'more',
          children: [
            {
              path: '',
              loadChildren: () =>
                import('./more/more.module').then(m => m.MorePageModule)
            }
          ]
        }
      ]
      },
      {
        path: 'customer',
        redirectTo: '/customer/home',
        pathMatch: 'full'
      }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerPageRoutingModule {}
