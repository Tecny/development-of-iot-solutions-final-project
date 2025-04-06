import { Routes } from '@angular/router';
import {LoginComponent} from './auth/components/login/login.component';
import {RegisterComponent} from './auth/components/register/register.component';
import {authGuard} from './core/guards/auth.guard';
import {ViewProfileComponent} from './features/profile/components/view-profile/view-profile.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ViewProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
