import { Routes } from '@angular/router';
import {LoginComponent} from './auth/components/login/login.component';
import {RegisterComponent} from './auth/components/register/register.component';
import {DashboardComponent} from './tempo/dashboard/dashboard.component';
import {guestGuard} from './core/guards/guest.guard';
import {authGuard} from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
