export interface ReservationRequest {
  id: number;
  gameDay: string;
  startTime: string;
  endTime: string;
  sportSpaceId: string;
}

interface SportSpace {
  name: string;
  imageUrl: string;
  price: number;
  amount: number;
  sport: string;
  gamemode: string;
}

export interface Reservation {
  id: number;
  name: string;
  type: string;
  sportSpaces: SportSpace;
  gameDay: string;
  startTime: string;
  endTime: string;
  status: string;
}
