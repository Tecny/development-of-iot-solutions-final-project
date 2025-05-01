interface SportSpace {
  id: number;
  name: string;
  image: string;
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
  sportSpace: SportSpace;
}

export interface Room {
  id: number;
  playerCount: string;
  reservation: Reservation;
}
