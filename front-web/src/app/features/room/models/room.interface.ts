interface SportSpace {
  id: number;
  name: string;
  sportType: string;
  gamemode: string;
  price: number;
  amount: number;
  district: string;
  address: string;
}

interface Reservation {
  id: number;
  startTime: string;
  endTime: string;
  gameDay: string;
  userName: string;
  reservationName: string;
  userId: number;
  sportSpaces: SportSpace;
}

export interface Room {
  id: number;
  playerCount: string;
  reservation: Reservation;
}
