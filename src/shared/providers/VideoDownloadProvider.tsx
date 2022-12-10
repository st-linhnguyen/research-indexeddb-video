import { Suspense, useEffect, useRef, useState } from 'react';

import { openDB, DBSchema } from 'idb';
import { createFFmpeg } from '@ffmpeg/ffmpeg';
import { Parser } from 'm3u8-parser';

import {
  getFileName,
  getFullUrl,
  StringToUint8Array,
  Uint8ArrayToString
} from '../services/common.service';
import { VideoDownloaderContext } from '../contexts/video-downloader.context';
import DOWNLOAD_STATUS from '../constants/download-status';
import { DownloadType } from '../types/download-status';

const ffmpeg = createFFmpeg({ log: true });

const VideoDownloadProvider = (props) => {
  const db = useRef<any>(null);
  const [downloaders, setDownloaders] = useState({});
  const [myIDB, setMyIDB] = useState();
  const [isFfmpegLoaded, setFfmpegLoaded] = useState(false);
  const downloadingVideos = useRef({});

  useEffect(() => {
    initVideoDownloader();
  }, []);

  const initVideoDownloader = async () => {
    await createDB();
    await initFfmpeg();
  };

  const initFfmpeg = async () => {
    await ffmpeg?.load();
    setFfmpegLoaded(true);
  };

  const createDB = async () => {
    db.current = await openDB('SavedVideos', 1, {
      upgrade(db, oldVersion, newVersion, transaction) {
        db.createObjectStore('media', { keyPath: 'id' });
      }
    });
    setMyIDB(db.current);
  };

  const updateDownloadState = (data: any, downloadStatus: DownloadType['status']) => {
    downloaders[data.id] = {
      ...data,
      downloadState: downloadStatus
    };
    if ([DOWNLOAD_STATUS.CANCELED, DOWNLOAD_STATUS.FINISHED].includes(downloadStatus)) {
      delete downloadingVideos.current[data.id];
      if (downloadStatus === DOWNLOAD_STATUS.CANCELED) {
        delete downloaders[data.id];
      }
    } else {
      downloadingVideos.current = {
        ...downloadingVideos?.current,
        [data.id]: {
          ...downloadingVideos?.current?.[data.id],
          status: downloadStatus
        }
      };
    }
    setDownloaders({ ...downloaders });
  };

  const updateDownloadingStorage = (data, isRemove = false) => {
    const localData = localStorage.getItem('downloading');
    if (localData) {
      const downloadingData = JSON.parse(localData);
      const dataIndex = downloadingData.findIndex(item => item.hlsUrl = data.hlsUrl);
      if (isRemove) {
        if (dataIndex >= 0) {
          downloadingData.splice(dataIndex, 1);
        }
      } else {
        if (dataIndex >= 0) {
          downloadingData[dataIndex] = data;
        } else {
          downloadingData.push(data);
        }
      }
      localStorage.setItem('downloading', JSON.stringify(downloadingData));
    } else {
      localStorage.setItem('downloading', JSON.stringify([{
        hrsUrl: data.hlsUrl,
        lastDownloadedInd: data.lastDownloadedIndex
      }]));
    }
  };

  const getAllTS = async (url: string) => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const uint8array = new Uint8Array(arrayBuffer);
    const data = Uint8ArrayToString(uint8array);
    let copyMediaList = data;
    const parser = new Parser();
    parser.push(data);
    parser.end();
    const { manifest } = parser;
    const { playlists, segments } = manifest;
    const reg = /(.*\/).*\.m3u8$/;
    const [_, prefixUrl]: any = url.match(reg);
    if (playlists?.length) {
      const playList = playlists[0];
      const fullUrl = getFullUrl(prefixUrl, playList.uri);
      const tsRes = await getAllTS(fullUrl);
      return tsRes;
    }
    if (segments?.length) {
      const results: any = [];
      let key;
      for (const item of segments) {
        const obj = {
          name: item.uri,
          fileName: getFileName(item.uri),
          path: getFullUrl(prefixUrl, item.uri),
        };
        if (!key && item.key) {
          key = item.key;
        }
        copyMediaList = copyMediaList.replace(obj.name, obj.fileName);
        results.push(obj);
      }
      if (key) {
        results.push({
          name: 'key.key',
          fileName: 'key.key',
          path: getFullUrl(prefixUrl, key.uri),
        });
        copyMediaList = copyMediaList.replace(key.uri, 'key.key');
      }
      return {
        tsArr: results,
        'index.m3u8': StringToUint8Array(copyMediaList)
      };
    }
    return null;
  };

  const onDownload = async (video) => {
    if (!isFfmpegLoaded) {
      return;
    }

    updateDownloadState(video, DOWNLOAD_STATUS.DOWNLOADING as DownloadType['status']);
    const targetVideo = downloaders?.[video.id];
    const data = await getAllTS(targetVideo.hlsUrl);
    const tsArr = data.tsArr;
    ffmpeg?.FS('writeFile', 'index.m3u8', data['index.m3u8']);

    for (let i = downloadingVideos?.current?.[video.id]?.lastDownloadedIndex + 1 || 1; i <= tsArr.length; i++) {
      const item = tsArr[i-1];
      try {
        if (downloadingVideos?.current?.[video.id]?.status === DOWNLOAD_STATUS.PAUSED) {
          console.log('PAUSED DOWNLOAD');
          return;
        } else {
          console.log(`DOWNLOADING ${ Math.floor(i * 100 / tsArr.length) }%`);
          const response = await fetch(item.path);
          const arrayBuffer = await response.arrayBuffer();
          const uint8array = new Uint8Array(arrayBuffer);
          ffmpeg?.FS(
            'writeFile',
            item.fileName,
            uint8array,
          );
          downloadingVideos.current[video.id].lastDownloadedIndex = i;
        }
      } catch (error) {
        downloadingVideos.current[video.id].lastDownloadedIndex = i;
        return;
      }
    }

    await ffmpeg?.run(
      '-allowed_extensions',
      'ALL',
      '-i',
      'index.m3u8',
      '-c',
      'copy',
      'output.mp4',
    );
    const uint8array = ffmpeg?.FS('readFile', 'output.mp4');
    const savedData = {
      ...video,
      data: uint8array
    };
    updateDownloadState(savedData, DOWNLOAD_STATUS.FINISHED as DownloadType['status']);
    saveToIDB(savedData);
    // updateDownloadingState({ hlsUrl: DUMMY_URLS.HLS_URL }, true);
  };

  const saveToIDB = async (video) => {
    const tx = await db?.current?.transaction('media', 'readwrite');
    const store = tx.objectStore('media');
    store.add(video, video.id);
    await tx.done;
  };

  const getVideoFromIDB = async (id: string | number) => {
    const transaction = await db?.current?.transaction(['media'], 'readonly');
    const store = transaction?.objectStore('media');
    const video = await store?.get(id);
    return video;
  };

  const getAllVideosFromIDB = async () => {
    const tx = await db?.current?.transaction('media', 'readonly');
    const store = tx?.objectStore('media');
    const videos = await store?.getAll();
    return videos;
  };

  const getDownloadingVideo = () => {
    // Handle get downloadingData from localStorage
  };

  const onCancel = (video) => {
    // Handle cancel download video
    // updateDownloadState(video, 'finished');
  };

  const toggleDownloader = (video, status) => {
    if (downloaders[video.id]) {
      updateDownloadState(video, status);
    }
  };

  return (
    <VideoDownloaderContext.Provider
      value={{
        myIDB,
        isFfmpegLoaded,
        downloaders,
        onDownload,
        toggleDownloader,
        onCancel,
        getVideoFromIDB,
        getAllVideosFromIDB,
        getDownloadingVideo
      }}
      { ...props }
    >
      { props.children }
      <Suspense fallback={<></>} />
    </VideoDownloaderContext.Provider>
  );
};

export default VideoDownloadProvider;
