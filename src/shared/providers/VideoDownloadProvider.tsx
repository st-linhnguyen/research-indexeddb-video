import { Suspense, useEffect, useRef, useState } from 'react';

import { openDB } from 'idb';
import { createFFmpeg } from '@ffmpeg/ffmpeg';
import { Parser } from 'm3u8-parser';

import {
  getFileName,
  getFullUrl,
  StringToUint8Array,
  Uint8ArrayToString
} from '../services/common.service';
import { VideoDownloaderContext } from '../contexts/video-downloader.context';

const ffmpeg = createFFmpeg({ log: true });

const VideoDownloadProvider = (props) => {
  const db = useRef<any>(null);
  const downloaders = useRef<any>({});
  const [myIDB, setMyIDB] = useState();
  const [isFfmpegLoaded, setFfmpegLoaded] = useState(false);

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
        db.createObjectStore('media');
        // store.createIndex('type', 'type');
      }
    });
    setMyIDB(db.current);
  };

  const updateDowloadState = (
    data: any,
    downloadStatus: 'downloading' | 'paused' | 'finished',
    lastDownloadedIndex?: number
  ) => {
    if (downloadStatus === 'finished' && !!downloaders[data.id]) {
      delete downloaders.current[data.id];
    } else {
      if (downloaders?.current?.[data.id]) {
        downloaders.current[data.id].dowloadState = downloadStatus;
        if (lastDownloadedIndex) {
          downloaders.current[data.id].lastDownloadedIndex = lastDownloadedIndex;
        }
      } else {
        downloaders.current[data.id] = {
          ...data,
          dowloadState: downloadStatus,
          lastDownloadedIndex
        };
      }
    }
    // setDownloaders({ ...downloaders });
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

    updateDowloadState(video, 'downloading');
    const targetVideo = downloaders?.current?.[video.id];
    const data = await getAllTS(targetVideo.hlsUrl);
    const tsArr = data.tsArr;
    ffmpeg?.FS('writeFile', 'index.m3u8', data['index.m3u8']);
    ffmpeg?.setProgress(({ ratio }) => {
      console.log({ ratio });
    });
    const downLoadResult = {
      successItems: [] as any,
      errorItems: [] as any,
      totalItems: tsArr,
    };
    for (let i = targetVideo?.lastDownloadedIndex + 1 || 1; i <= tsArr.length; i++) {
      const item = tsArr[i-1];
      try {
        const response = await fetch(item.path);
        const arrayBuffer = await response.arrayBuffer();
        const uint8array = new Uint8Array(arrayBuffer);
        if (targetVideo?.downloadState === 'paused') {
          console.log('PAUSED DOWNLOAD');
          return;
        } else {
          console.log(`DOWNLOADING ${ i }`);
          ffmpeg?.FS(
            'writeFile',
            item.fileName,
            uint8array,
          );
          // console.log({ item });
          video.lastDownloadedIndex = i;
          // setDownloadedPercent(Math.floor(i * 100 / tsArr.length));
          downLoadResult.successItems.push(item);
          // console.log(`Last index: ${ video?.lastDownloadedIndex }`);
        }
      } catch (error) {
        // lastDownloadedIndex.current = i;
        downLoadResult.errorItems.push(item);
        return;
      }
    }

    updateDowloadState(video, 'finished');
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
    // setVideoUrl(URL.createObjectURL(new Blob([uint8array.buffer], { type: 'video/mp4' })));
    const savedData = {
      ...video,
      data: uint8array
    };
    saveToIDB(savedData);
    // updateDownloadingState({ hlsUrl: DUMMY_URLS.HLS_URL }, true);
  };

  const saveToIDB = async (video) => {
    const tx = await db?.current?.transaction('media', 'readwrite');
    const store = tx.objectStore('media');
    store.add(video);
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

  const onCancel = (videoId) => {
    // Handle cancel download video
    // updateDowloadState(videoId, 'finished');
  };

  const onPause = (videoId) => {
    // Handle pause download video
    // updateDowloadState(videoId, 'paused');
  };

  const onResume = (videoId) => {
    // Handle pause download video
    // updateDowloadState(videoId, 'downloading');
  };

  return (
    <VideoDownloaderContext.Provider
      value={{
        myIDB,
        isFfmpegLoaded,
        downloaders,
        onDownload,
        onPause,
        onResume,
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
