import type { AudioTrack } from './AudioTrack';
import type { VideoTrack } from './VideoTrack';
import type { ImageTrack } from './ImageTrack';
import type { TextTrack } from './TextTrack';
//这边是能添加的所有轨道数据

export type Track = AudioTrack | ImageTrack | TextTrack | VideoTrack;

export interface TrackLineItem {
  type: Track['type'],
  main?: boolean,
  list: Track[]
}