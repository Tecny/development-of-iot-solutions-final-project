export interface ReservationRequest {
  id: number;
  gameDay: string;
  startTime: string;
  endTime: string;
  sportSpaceId: string;
}

interface SportSpace {
  id: number;
  name: string;
  image: string;
  price: number;
  amount: number;
  sport: string;
  gamemode: string;
  address: string;
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
