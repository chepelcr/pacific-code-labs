import mediaData from "../content/media.json";
import type { MediaItem, MediaLibrary } from "@/lib/media";

/** The media library (`media.json`) — uploaded/local + external assets. */
export function getMediaLibrary(): MediaLibrary {
  return mediaData as MediaLibrary;
}

export function getMediaItems(): MediaItem[] {
  return (mediaData as MediaLibrary).items;
}
