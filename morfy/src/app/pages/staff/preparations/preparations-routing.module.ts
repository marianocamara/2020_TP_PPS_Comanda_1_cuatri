import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PreparationsPage } from './preparations.page';

const routes: Routes = [
  {
    path: '',
    component: PreparationsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PreparationsPageRoutingModule {}
