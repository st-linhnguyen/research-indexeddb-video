// import { useEffect, useRef, useState } from 'react';

// import { Parser } from 'm3u8-parser';
// import { openDB } from 'idb';
// import { createFFmpeg } from '@ffmpeg/ffmpeg';

import './App.scss';
// import DUMMY_URLS from './shared/constants/dummy-data';
// import {
//   getFileName,
//   getFullUrl,
//   StringToUint8Array,
//   Uint8ArrayToString
// } from './shared/services/common.service';
import Videos from './components/Videos';
import VideoDownloadProvider from './shared/providers/VideoDownloadProvider';

const App = () => {
  // const originalVideo = useRef(null);
  // const resultVideo = useRef(null);
  // const lastDownloadedIndex = useRef(1);
  // const db = useRef<any>(null);
  // const ffmpeg = useRef<any>(null);
  // const [videoUrl, setVideoUrl] = useState<any>();
  // const [downloadedPercent, setDownloadedPercent] = useState<any>(0);
  // const [paused, setPaused] = useState<any>(0);
  // const isPaused = useRef<boolean>(false);
  // isPaused.current = paused;

  // useEffect(() => {
  //   setVideoFromIndexedDb();
  //   initFfmpeg();
  // }, []);

  // const createDB = async () => {
  //   db.current = await openDB('SavedVideos', 1, {
  //     upgrade(db, oldVersion, newVersion, transaction) {
  //       const store = db.createObjectStore('media', {
  //         autoIncrement: true,
  //         keyPath: 'id'
  //       });
  //       store.createIndex('type', 'type');
  //     }
  //   });
  // };

  // const addData = async (video) => {
  //   const tx = await db.current.transaction('media', 'readwrite');
  //   const store = tx.objectStore('media');
  //   store.add(video);
  //   await tx.done;
  // };

  // const getData = async () => {
  //   const tx = await db.current.transaction('media', 'readonly');
  //   const store = tx.objectStore('media');
  //   const value = await store.get(2);
  //   const blob = new Blob([value], { type: 'video/mp4' });
  //   setVideoUrl(URL.createObjectURL(blob));
  // };

  // const setVideoFromIndexedDb = async () => {
  //   await createDB();
  //   await getData();
  // };

  // const getAllTS = async (url) => {
  //   const response = await fetch(url);
  //   const arrayBuffer = await response.arrayBuffer();
  //   const uint8array = new Uint8Array(arrayBuffer);
  //   const data = Uint8ArrayToString(uint8array);
  //   let copyMediaList = data;
  //   const parser = new Parser();
  //   parser.push(data);
  //   parser.end();
  //   const { manifest } = parser;
  //   const { playlists, segments } = manifest;
  //   const reg = /(.*\/).*\.m3u8$/;
  //   const [_, prefixUrl]: any = DUMMY_URLS.HLS_URL.match(reg);
  //   if (playlists?.length) {
  //     const playList = playlists[0];
  //     const fullUrl = getFullUrl(prefixUrl, playList.uri);
  //     const tsRes = await getAllTS(fullUrl);
  //     return tsRes;
  //   }
  //   if (segments?.length) {
  //     const results: any = [];
  //     let key;
  //     for (const item of segments) {
  //       const obj = {
  //         name: item.uri,
  //         fileName: getFileName(item.uri),
  //         path: getFullUrl(prefixUrl, item.uri),
  //       };
  //       if (!key && item.key) {
  //         key = item.key;
  //       }
  //       copyMediaList = copyMediaList.replace(obj.name, obj.fileName);
  //       results.push(obj);
  //     }
  //     if (key) {
  //       results.push({
  //         name: 'key.key',
  //         fileName: 'key.key',
  //         path: getFullUrl(prefixUrl, key.uri),
  //       });
  //       copyMediaList = copyMediaList.replace(key.uri, 'key.key');
  //     }
  //     return { tsArr: results, 'index.m3u8': StringToUint8Array(copyMediaList) };
  //   }
  //   return null;
  // };

  // const initFfmpeg = async () => {
  //   ffmpeg.current = createFFmpeg({
  //     corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
  //     log: true,
  //   });
  //   await ffmpeg?.current?.load();
  // };

  // const setTS = async () => {
  //   if (!ffmpeg.current) {
  //     return;
  //   }

  //   const data = await getAllTS(DUMMY_URLS.HLS_URL);
  //   const tsArr = data.tsArr;
  //   ffmpeg?.current?.FS('writeFile', 'index.m3u8', data['index.m3u8']);
  //   ffmpeg?.current?.setProgress(({ ratio }) => {
  //     console.log({ ratio });
  //   });
  //   const downLoadResult = {
  //     successItems: [] as any,
  //     errorItems: [] as any,
  //     totalItems: tsArr,
  //   };
  //   for (let i = lastDownloadedIndex.current + 1; i <= tsArr.length; i++) {
  //     const item = tsArr[i-1];
  //     try {
  //       const response = await fetch(item.path);
  //       const arrayBuffer = await response.arrayBuffer();
  //       const uint8array = new Uint8Array(arrayBuffer);
  //       if (isPaused.current) {
  //         console.log('PAUSED DOWNLOAD');
  //         return;
  //       } else {
  //         console.log(`DOWNLOADING ${ i }`);
  //         ffmpeg?.current?.FS(
  //           'writeFile',
  //           item.fileName,
  //           uint8array,
  //         );
  //         console.log({ item });
  //         lastDownloadedIndex.current = i;
  //         setDownloadedPercent(Math.floor(i * 100 / tsArr.length));
  //         downLoadResult.successItems.push(item);
  //         console.log(`Last index: ${ lastDownloadedIndex.current }`);
  //       }
  //     } catch (error) {
  //       lastDownloadedIndex.current = i;
  //       downLoadResult.errorItems.push(item);
  //       return;
  //     }
  //   }

  //   console.log({ downLoadResult });
  //   await ffmpeg?.current?.run(
  //     '-allowed_extensions',
  //     'ALL',
  //     '-i',
  //     'index.m3u8',
  //     '-c',
  //     'copy',
  //     'output.mp4',
  //   );
  //   const uint8array = ffmpeg?.current?.FS('readFile', 'output.mp4');
  //   console.log({ uint8array });
  //   setVideoUrl(URL.createObjectURL(new Blob([uint8array.buffer], { type: 'video/mp4' })));
  //   addData(uint8array);
  //   updateDownloadingState({ hlsUrl: DUMMY_URLS.HLS_URL }, true);
  // };

  // const updateDownloadingState = (data, isRemove = false) => {
  //   const localData = localStorage.getItem('downloading');
  //   if (localData) {
  //     const downloadingData = JSON.parse(localData);
  //     const dataIndex = downloadingData.findIndex(item => item.hlsUrl = data.hlsUrl);
  //     if (isRemove) {
  //       if (dataIndex >= 0) {
  //         downloadingData.splice(dataIndex, 1);
  //       }
  //     } else {
  //       if (dataIndex >= 0) {
  //         downloadingData[dataIndex] = data;
  //       } else {
  //         downloadingData.push(data);
  //       }
  //     }
  //     localStorage.setItem('downloading', JSON.stringify(downloadingData));
  //   } else {
  //     localStorage.setItem('downloading', JSON.stringify([{
  //       hrsUrl: DUMMY_URLS.HLS_URL,
  //       lastDownloadedInd: lastDownloadedIndex.current
  //     }]));
  //   }
  // };

  // const toggleDownload = () => {
  //   if (isPaused.current) {
  //     setTS();
  //   } else {
  //     updateDownloadingState({
  //       hlsUrl: DUMMY_URLS.HLS_URL,
  //       lastDownloadedInd: lastDownloadedIndex.current
  //     });
  //   }
  //   setPaused(prev => !prev);
  // };

  return (
    // <div className="demo-download-video">
    //   <div className="video-container">
    //     <div className="video-box">
    //       <video ref={ originalVideo } src={ DUMMY_URLS.MP4_URL } crossOrigin="anonymous" controls />
    //       <video ref={ resultVideo } src={ videoUrl } controls />
    //     </div>
    //     <button className="btn btn-download" onClick={ setTS }>
    //       Download
    //     </button>
    //     {
    //       !!downloadedPercent &&
    //       <>
    //         <p className="downloaded-percent">{ downloadedPercent }%</p>
    //         <button className="btn btn-toggle-download" onClick={ toggleDownload }>
    //           { paused ? 'Resume' : 'Pause' }
    //         </button>
    //       </>
    //     }
    //   </div>
    // </div>
    <VideoDownloadProvider>
      <Videos />
    </VideoDownloadProvider>
  );
};

export default App;
