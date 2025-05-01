import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {RoomService} from '../../features/room/services/room.service';

export const roomGuard: CanActivateFn = (route) => {
  const roomId = route.params['id'];
  const roomService = inject(RoomService);
  const router = inject(Router);

  if (roomService.hasAccess(roomId)) {
    return true;
  }

  router.navigate(['/rooms']).then();
  return false;
};

