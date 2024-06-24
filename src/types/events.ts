export interface PlayerEvent {
  /*
   * room: room id
   * event: play | pause | seeked
   * user: name
   * time: video current time
   * url: video url
   */
  room: string;
  event: string;
  user: string;
  time: number | null;
  url: string | null;
}

export interface QueueItem {
  user: string;
  url: string;
  active: boolean;
}

export interface QueueEvent {
  room: string;
  event: string;
  items: Array<QueueItem> | null;
}
