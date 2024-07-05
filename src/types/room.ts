export interface Room {
  id: string;
  name: string;
  users: RoomUser[];
}

export interface RoomUser {
  id: string;
  name: string;
}
