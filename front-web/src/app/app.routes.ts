import { Routes } from '@angular/router';
import {LoginComponent} from './auth/components/login/login.component';
import {RegisterComponent} from './auth/components/register/register.component';
import {authGuard} from './core/guards/auth.guard';
import {ViewProfileComponent} from './features/profile/components/view-profile/view-profile.component';
import {UnauthorizedComponent} from './shared/pages/unauthorized/unauthorized.component';
import {NotFoundComponent} from './shared/pages/not-found/not-found.component';
import {UserRole} from './core/models/user.role.enum';
import {
  ViewSubscriptionComponent
} from './features/subscription/components/view-subscription/view-subscription.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },
  {
    path: 'profile',
    component: ViewProfileComponent,
    canActivate: [authGuard],
    data: { roles: [UserRole.PLAYER, UserRole.OWNER] },
  },
  {
    path: 'subscription',
    component: ViewSubscriptionComponent,
    canActivate: [authGuard],
    data: { roles: [UserRole.OWNER] },
  },
  {
    path: 'notfound',
    component: NotFoundComponent,
    canActivate: [authGuard] },
  { path: '**',
    redirectTo: 'notfound'
  }
];
