import { createContext, useContext } from 'react';

export interface VideoDownloader {
  id: number | string;
  hlsUrl: string;
  videoName: string;
  videoDesc?: string;
  videoThumbnail?: string;
}

export const VideoDownloaderContext = createContext({
  downloaders: [],
  onDownload: (data) => data,
  onPause: (id) => id,
  onResume: (id) => id,
  onCancel: (id) => id,
  getVideoFromIDB: (id) => id,
  getAllVideosFromIDB: () => true,
  getDownloadingVideo: (id) => id
});

export const useVideoDownloader = () => {
  const context = useContext(VideoDownloaderContext);
  if (context) {
    return context;
  }
};
