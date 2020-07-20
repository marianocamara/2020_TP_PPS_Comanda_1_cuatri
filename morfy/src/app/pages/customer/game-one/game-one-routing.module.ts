import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GameOnePage } from './game-one.page';

const routes: Routes = [
  {
    path: '',
    component: GameOnePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameOnePageRoutingModule {}
