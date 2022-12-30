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
  const [canBackup, setCanBackup] = useState(null);

  useEffect(() => {
    initVideoDownloader();
  }, []);

  useEffect(() => {
    syncWithLocalStorage();
  }, [isFfmpegLoaded]);

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
        db.createObjectStore('downloading');
      }
    });
    setMyIDB(db.current);
  };

  const updateDownloadState = async (data: any, downloadStatus: DownloadType['status']) => {
    downloaders[data.id] = {
      ...data,
      downloadState: downloadStatus
    };
    if ([DOWNLOAD_STATUS.CANCELED, DOWNLOAD_STATUS.FINISHED].includes(downloadStatus)) {
      delete downloadingVideos.current[data.id];
      if (downloadStatus === DOWNLOAD_STATUS.CANCELED) {
        delete downloaders[data.id];
      }
      updateDownloadingData(data.id, 'delete', 'downloading');
    } else {
      downloadingVideos.current = {
        ...downloadingVideos?.current,
        [data.id]: {
          ...downloadingVideos?.current?.[data.id],
          downloadState: downloadStatus
        }
      };
    }
    setDownloaders({ ...downloaders });
  };

  const updateDownloadingData = async (
    id: number | string,
    action: 'update' | 'delete',
    storeName: string
  ) => {
    const transaction = await db?.current?.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const backupData = {
      ...downloaders[id],
      ...downloadingVideos.current[id]
    };
    if (action === 'delete') {
      await store.delete(id);
    } else {
      await store.put(backupData, backupData.id);
    }
    await transaction.done;
  };

  const syncWithLocalStorage = async () => {
    const videos = await getAllVideosFromIDB('downloading');
    if (videos?.length) {
      videos.forEach(item => {
        downloadingVideos.current[item.id] = {
          downloadState: item.downloadState,
          lastDownloadedIndex: item.lastDownloadedIndex,
          downloadedData: item.downloadedData
        };
        downloaders[item.id] = { ...item };
        delete downloaders[item.id].lastDownloadedIndex;
        delete downloaders[item.id].downloadedData;
        if (item.downloadState === DOWNLOAD_STATUS.DOWNLOADING) {
          onDownload(item);
        }
      });
      setDownloaders({ ...downloaders });
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
    ffmpeg?.FS('writeFile', `index-${video?.id}.m3u8`, data['index.m3u8']);

    for (let i = 1; i <= tsArr.length; i++) {
      const item = tsArr[i-1];
      try {
        if (downloadingVideos?.current?.[video.id]?.downloadState === DOWNLOAD_STATUS.PAUSED) {
          console.log('PAUSED DOWNLOAD');
          updateDownloadingData(video.id, 'update', 'downloading');
          return;
        } else {
          const downloadedData = downloadingVideos.current[video.id].downloadedData;
          if (downloadedData?.[i]) {
            ffmpeg?.FS(
              'writeFile',
              item.fileName,
              downloadedData[i],
            );
          } else {
            const response = await fetch(item.path);
            const arrayBuffer = await response.arrayBuffer();
            const uint8array = new Uint8Array(arrayBuffer);
            ffmpeg?.FS(
              'writeFile',
              item.fileName,
              uint8array,
            );
            downloadingVideos.current[video.id].lastDownloadedIndex = i;
            if (downloadingVideos.current[video.id].downloadedData) {
              downloadingVideos.current[video.id].downloadedData[i] = uint8array;
            } else {
              downloadingVideos.current[video.id].downloadedData = {
                [i]: uint8array
              };
            }
            console.log(`DOWNLOADING ${ Math.floor(i * 100 / tsArr.length) }%`);
            updateDownloadingData(video.id, 'update', 'downloading');
          }
        }
      } catch (error) {
        console.log(error);
        if (downloadingVideos.current[video.id]) {
          downloadingVideos.current[video.id].lastDownloadedIndex = i;
        }
        return;
      }
    }

    await ffmpeg?.run(
      '-allowed_extensions',
      'ALL',
      '-i',
      `index-${video.id}.m3u8`,
      '-c',
      'copy',
      `output-${video.id}.mp4`,
    );
    const uint8array = ffmpeg?.FS('readFile', `output-${video.id}.mp4`);
    const savedData = {
      ...video,
      data: uint8array
    };
    updateDownloadState(savedData, DOWNLOAD_STATUS.FINISHED as DownloadType['status']);
    await saveToIDB(savedData, 'media');
  };

  const saveToIDB = async (data, storeName: string) => {
    const tx = await db?.current?.transaction('media', 'readwrite');
    const store = tx.objectStore(storeName);
    store.add(data, data.id);
    await tx.done;
  };

  const getVideoFromIDB = async (id: string | number, storeName: string) => {
    const transaction = await db?.current?.transaction([storeName], 'readonly');
    const store = transaction?.objectStore(storeName);
    const video = await store?.get(id);
    return video;
  };

  const getAllVideosFromIDB = async (storeName: string) => {
    const tx = await db?.current?.transaction(storeName, 'readonly');
    const store = tx?.objectStore(storeName);
    const videos = await store?.getAll();
    return videos;
  };

  const getDownloadingVideo = () => {
    // Handle get downloadingData from localStorage
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
