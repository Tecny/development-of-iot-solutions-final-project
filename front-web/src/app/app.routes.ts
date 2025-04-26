import { Routes } from '@angular/router';
import {LoginComponent} from './auth/components/login/login.component';
import {RegisterComponent} from './auth/components/register/register.component';
import {authGuard} from './core/guards/auth.guard';
import {ViewProfileComponent} from './features/profile/pages/view-profile/view-profile.component';
import {UnauthorizedComponent} from './shared/pages/unauthorized/unauthorized.component';
import {NotFoundComponent} from './shared/pages/not-found/not-found.component';
import {UserRole} from './core/models/user.role.enum';
import {roomGuard} from './core/guards/room.guard';

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
    loadComponent: () => import('./features/subscription/pages/view-subscription/view-subscription.component')
      .then(m => m.ViewSubscriptionComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.OWNER] },
  },
  {
    path: 'sport-spaces',
    loadComponent: () => import('./features/sport-space/pages/list-sport-spaces/list-sport-spaces.component')
      .then(m => m.ListSportSpacesComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.PLAYER, UserRole.OWNER] },
  },
  {
    path: 'sport-spaces/create',
    loadComponent: () => import('./features/sport-space/pages/create-sport-space/create-sport-space.component')
      .then(m => m.CreateSportSpaceComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.OWNER] },
  },
  {
    path: 'sport-spaces/:id',
    loadComponent: () => import('./features/sport-space/pages/sport-space-detail/sport-space-detail.component')
      .then(m => m.SportSpaceDetailComponent),
  },
  {
    path: 'reservations',
    loadComponent: () => import('./features/reservation/pages/list-reservations/list-reservations.component')
      .then(m => m.ListReservationsComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.PLAYER] },
  },
  {
    path: 'rooms',
    loadComponent: () => import('./features/room/pages/list-rooms/list-rooms.component')
      .then(m => m.ListRoomsComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.PLAYER] },
  },
  {
    path: 'rooms/:id',
    loadComponent: () => import('./features/room/pages/room-detail/room-detail.component')
      .then(m => m.RoomDetailComponent),
    canActivate: [authGuard, roomGuard],
    data: { roles: [UserRole.PLAYER] },
  },
  {
    path: 'notfound',
    component: NotFoundComponent,
    canActivate: [authGuard]
  },
  { path: '**',
    redirectTo: 'notfound'
  }
];
