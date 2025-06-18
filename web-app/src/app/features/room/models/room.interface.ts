interface SportSpace {
  id: number;
  name: string;
  imageUrl: string;
  address: string;
  sportType: string;
  gamemode: string;
  price: number;
  amount: number;
}

interface Reservation {
  id: number;
  startTime: string;
  endTime: string;
  gameDay: string;
  userName: string;
  reservationName: string;
  userId: number;
  status: string;
  sportSpace: SportSpace;
}

export interface Room {
  id: number;
  playerCount: string;
  reservation: Reservation;
}
