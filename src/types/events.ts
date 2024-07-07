/*
 * Author: Alexandre Kaul
 * Matrikelnummer: 2552912
 */

export interface PlayerEvent {
  /*
   * room: room id
   * event:
   *    play | pause | sync |
   *    sync-ack-play | sync-ack-pause |
   *    re-sync | play-video
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
  /*
   * user: name
   * url: video url
   * active: video currently being played
   */
  user: string;
  url: string;
  active: boolean;
}

export interface QueueEvent {
  /*
   * room: room id
   * event: add-video | delete-video | sync-queue
   * items: QueueItem[0..*]
   */
  room: string | null;
  event: string;
  items: Array<QueueItem>;
}
