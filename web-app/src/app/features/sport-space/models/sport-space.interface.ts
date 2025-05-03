export interface SportSpace {
  id: number;
  name: string;
  image: string;
  sportId: number;
  gamemodeId: number;
  price: number;
  amount: number;
  districtId: number;
  address: string;
  description: string;
  openTime: string;
  closeTime: string;
  user: User;
}

interface User {
  id: number;
  name: string;
}
