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

const VideoDownloadProvider = (props) => {
  const db = useRef<any>(null);
  const ffmpeg = useRef<any>(null);
  const downloaders = useRef<any>({});
  // const [downloaders, setDownloaders] = useState({});

  useEffect(() => {
    initVideoDownloader();
  }, []);

  const initVideoDownloader = async () => {
    await createDB();
    await initFfmpeg();
  };

  const initFfmpeg = async () => {
    ffmpeg.current = createFFmpeg({ log: true });
    await ffmpeg?.current?.load();
  };

  const createDB = async () => {
    db.current = await openDB('SavedVideos', 1, {
      upgrade(db, oldVersion, newVersion, transaction) {
        const store = db.createObjectStore('media');
        store.createIndex('type', 'type');
      }
    });
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
        downloaders.current[data.id].lastDownloadedIndex = lastDownloadedIndex;
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
    if (!ffmpeg.current) {
      return;
    }

    updateDowloadState(video, 'downloading');
    const targetVideo = downloaders?.current?.[video.id];
    const data = await getAllTS(targetVideo.hlsUrl);
    const tsArr = data.tsArr;
    ffmpeg?.current?.FS('writeFile', 'index.m3u8', data['index.m3u8']);
    ffmpeg?.current?.setProgress(({ ratio }) => {
      console.log({ ratio });
    });
    const downLoadResult = {
      successItems: [] as any,
      errorItems: [] as any,
      totalItems: tsArr,
    };
    for (let i = targetVideo?.lastDownloadedIndex + 1; i <= tsArr.length; i++) {
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
          ffmpeg?.current?.FS(
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
    await ffmpeg?.current?.run(
      '-allowed_extensions',
      'ALL',
      '-i',
      'index.m3u8',
      '-c',
      'copy',
      'output.mp4',
    );
    const uint8array = ffmpeg?.current?.FS('readFile', 'output.mp4');
    // console.log({ uint8array });
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
    const tx = await db?.current?.transaction('media', 'readonly');
    const store = tx?.objectStore('media');
    const video = await store?.get(id);
    const blob = new Blob([video?.data], { type: 'video/mp4' });
    return URL.createObjectURL(blob);
    // setVideoUrl(URL.createObjectURL(blob));
  };

  const getAllVideosFromIDB = async () => {
    const tx = await db?.current?.transaction('media', 'readonly');
    const store = tx?.objectStore('media');
    const values = await store?.getAll();
    return values;
    // setVideoUrl(URL.createObjectURL(blob));
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
