import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerPage } from './customer.page';

const routes: Routes = [
  {
    path: '',
    component: CustomerPage
  },
  {
    path: 'main',
    loadChildren: () => import('./main/main.module').then( m => m.MainPageModule)
  },
  {
    path: 'waiting-list',
    loadChildren: () => import('./waiting-list/waiting-list.module').then( m => m.WaitingListPageModule)
  },
  {
    path: '',
    redirectTo: 'CustomerPage',
    pathMatch: 'full'
  },  {
    path: 'game-one',
    loadChildren: () => import('./game-one/game-one.module').then( m => m.GameOnePageModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerPageRoutingModule {}
