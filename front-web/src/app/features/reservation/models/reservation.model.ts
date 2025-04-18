export interface ReservationRequest {
  id: number;
  gameDay: string;
  startTime: string;
  endTime: string;
  sportSpaceId: string;
}

export interface Reservation {
  id: number;
  name: string;
  type: string;
  sportSpaces: {
    name: string;
    image: string;
    price: number;
    amount: number;
    sport: string;
    gamemode: string;
  }
  gameDay: string;
  startTime: string;
  endTime: string;
  status: string;
}
