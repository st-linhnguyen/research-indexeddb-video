import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { useVideoDownloader } from '../shared/contexts/video-downloader.context';
import DOWNLOAD_STATUS from '../shared/constants/download-status';

const VideoItem = ({ data }) => {
  const originalVideo = useRef<any>(null);
  const resultVideo = useRef(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isDownloadStarted, setDownloadStarted] = useState(false);
  const [paused, setPaused] = useState<boolean>();
  const {
    downloaders,
    myIDB,
    isFfmpegLoaded,
    getVideoFromIDB,
    onDownload,
    toggleDownloader
  }: any = useVideoDownloader();

  useEffect(() => {
    if (myIDB) {
      getLocalData();
    }
  }, [myIDB]);

  useEffect(() => {
    if (downloaders?.[data.id]?.downloadState === DOWNLOAD_STATUS.FINISHED) {
      console.log(123123, downloaders);
      // Load video at offline mode
      const blob = new Blob([downloaders?.[data.id]?.data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    }
  }, [downloaders]);

  useEffect(() => {
    if (typeof paused === 'boolean') {
      if (paused) {
        toggleDownloader(data, DOWNLOAD_STATUS.PAUSED);
      } else {
        onDownload(data);
      }
    }
  }, [paused]);

  const getLocalData = async () => {
    const result = await getVideoFromIDB(data?.id);
    if (result) {
      const blob = new Blob([result?.data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    } else {
      loadOriginUrl();
    }
  };

  const loadOriginUrl = () => {
    const hls = new Hls();
    hls.loadSource(data.hlsUrl);
    hls.attachMedia(originalVideo?.current);
  };

  const toggleDownload = () => {
    setPaused(prev => !prev);
  };

  const handleDownload = () => {
    setDownloadStarted(true);
    onDownload(data);
  };

  return (
    <div className="video-card">
      <div className="video-box">
        {
          videoUrl ?
            <>
              <p>Offline Video</p>
              <video ref={ resultVideo } src={ videoUrl } controls />
            </> :
            <>
              <p>Original Video</p>
              <video ref={ originalVideo } controls />
            </>
        }
      </div>
      {
        !videoUrl &&
        <>
          {
            isDownloadStarted ?
              <>
                <button className="btn btn-toggle-download" onClick={ toggleDownload }>
                  { paused ? 'Resume' : 'Pause' }
                </button>
              </> :
              <button className="btn btn-download" disabled={ !isFfmpegLoaded } onClick={ handleDownload }>
                Download
              </button>
          }
        </>
      }
    </div>
  );
};

export default VideoItem;
