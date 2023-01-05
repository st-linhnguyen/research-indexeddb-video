import { createContext, useContext } from 'react';

export interface VideoDownloader {
  id: number | string;
  hlsUrl: string;
  videoName: string;
  videoDesc?: string;
  videoThumbnail?: string;
}

export const VideoDownloaderContext = createContext({
  myIDB: indexedDB,
  isFfmpegLoaded: Boolean,
  downloaders: Object,
  onDownload: (data) => data,
  toggleDownloader: (video, status) => true,
  getVideoFromIDB: (id) => id,
  getAllVideosFromIDB: () => true
});

export const useVideoDownloader = () => {
  const context = useContext(VideoDownloaderContext);
  if (context) {
    return context;
  }
};
