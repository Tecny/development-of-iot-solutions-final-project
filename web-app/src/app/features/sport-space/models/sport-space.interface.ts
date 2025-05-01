export interface SportSpace {
  "id": number;
  "name": string;
  "image": string;
  "sportType": string;
  "gamemode": string;
  "price": number;
  "amount": number;
  "district": string;
  "address": string;
  "description": string;
  "openTime": string;
  "closeTime": string;
  "user": User;
}

interface User {
  "id": number;
  "name": string;
}
