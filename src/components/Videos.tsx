import { useEffect } from 'react';
import DUMMY_URLS from '../shared/constants/dummy-data';
import VideoItem from './VideoItem';

const Videos = () => {
  const dummyData = DUMMY_URLS.LIST_VIDEOS;

  return (
    <div className="demo-download-video">
      <div className="video-container">
        {
          dummyData?.map((video, index) => (
            <VideoItem key={ index } data={ video } />
          ))
        }
      </div>
    </div>
  );
};

export default Videos;
