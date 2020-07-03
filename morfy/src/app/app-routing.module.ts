import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: 'staff',
    loadChildren: () => import('./pages/staff/staff.module').then( m => m.StaffPageModule)
  },
  {
    path: 'customer',
    loadChildren: () => import('./pages/customer/customer.module').then( m => m.CustomerPageModule)
  },
  {
    path: 'signin',
    loadChildren: () => import('./pages/authentication/signin/signin.module').then( m => m.SigninPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./pages/authentication/signup/signup.module').then( m => m.SignupPageModule)
  },
  {
    path: 'welcome',
    loadChildren: () => import('./pages/authentication/welcome/welcome.module').then( m => m.WelcomePageModule)
  },
  {
    path: 'approval',
    loadChildren: () => import('./pages/authentication/approval/approval.module').then( m => m.ApprovalPageModule)
  },  {
    path: 'chat',
    loadChildren: () => import('./pages/chat/chat.module').then( m => m.ChatPageModule)
  },
  {
    path: 'survey',
    loadChildren: () => import('./pages/survey/survey.module').then( m => m.SurveyPageModule)
  },





];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
