import { useEffect, useRef, useState } from 'react';
import { useVideoDownloader } from '../shared/contexts/video-downloader.context';

const VideoItem = ({ data }) => {
  const originalVideo = useRef(null);
  const resultVideo = useRef(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isDownloadStarted, setDownloadStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const { myIDB, getDBState, getVideoFromIDB, onDownload }: any = useVideoDownloader();

  useEffect(() => {
    if (myIDB) {
      getLocalData();
    }
  }, [myIDB]);

  const getLocalData = async () => {
    const result = await getVideoFromIDB(data?.id);
    if (result) {
      setVideoUrl(result);
    }
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
        <video ref={ originalVideo } src={ data.hlsUrl } crossOrigin="anonymous" controls />
        {
          !!videoUrl &&
          <video ref={ resultVideo } src={ videoUrl } controls />
        }
      </div>
      {
        isDownloadStarted ?
          <>
            <button className="btn btn-toggle-download" onClick={ toggleDownload }>
              { paused ? 'Resume' : 'Pause' }
            </button>
          </> :
          <button className="btn btn-download" onClick={ handleDownload }>
            Download
          </button>
      }
    </div>
  );
};

export default VideoItem;
