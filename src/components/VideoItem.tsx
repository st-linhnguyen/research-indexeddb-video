import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { useVideoDownloader } from '../shared/contexts/video-downloader.context';
import DOWNLOAD_STATUS from '../shared/constants/download-status';

const VideoItem = ({ data }) => {
  const originalVideo = useRef<any>(null);
  const resultVideo = useRef(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isDownloadStarted, setDownloadStarted] = useState(false);
  const {
    downloaders,
    myIDB,
    isFfmpegLoaded,
    getVideoFromIDB,
    onDownload,
    toggleDownloader
  }: any = useVideoDownloader();
  const [paused, setPaused] = useState<boolean>(downloaders?.[data.id]?.downloadState);

  useEffect(() => {
    if (myIDB) {
      getLocalData();
    }
  }, [myIDB]);

  useEffect(() => {
    if (downloaders?.[data.id]?.downloadState === DOWNLOAD_STATUS.FINISHED) {
      // Load video at offline mode
      const blob = new Blob([downloaders?.[data.id]?.data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    } else if (downloaders?.[data.id]?.downloadState) {
      setDownloadStarted(true);
      setPaused(downloaders?.[data.id]?.downloadState === DOWNLOAD_STATUS.PAUSED);
    }
  }, [downloaders?.[data.id]]);

  const getLocalData = async () => {
    const result = await getVideoFromIDB(data?.id, 'media');
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
    if (paused) {
      onDownload(data);
    } else {
      toggleDownloader(data, DOWNLOAD_STATUS.PAUSED);
    }
    setPaused(prev => !prev);
  };

  const handleDownload = () => {
    setDownloadStarted(true);
    onDownload(data);
  };

  const onCancel = () => {
    setDownloadStarted(false);
    toggleDownloader(data, DOWNLOAD_STATUS.CANCELED);
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
                <div className="downloader-progress-bar">
                  <p className="downloader-percent">10%</p>
                  <div className="downloader-box">
                    <div className="downloader-progress" style={{ width: '40%' }} />
                  </div>
                </div>
                <div className="btn-group">
                  <button className="btn btn-toggle-download" onClick={ toggleDownload }>
                    { paused ? 'Resume' : 'Pause' }
                  </button>
                  <button className="btn btn-toggle-download" onClick={ onCancel }>
                    Cancel
                  </button>
                </div>
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
