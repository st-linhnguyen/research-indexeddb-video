const DUMMY_URLS = {
  'HLS_URL': 'https://d2f4esnoce5l6k.cloudfront.net/smil:uZFn5UJlWwgGM7nJqbdIMEDIA202212071507571670400477663xQfv9mp4.smil/playlist.m3u8',
  'MP4_URL': 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'IMG_URL': 'https://ghost.hacksoft.io/content/images/2021/03/image-4.png',
  'IMG_URL_1': 'https://images.dev2.lunativi.com/4/NTSkR638Pu63hLFUMecj_MEDIA_20220926-145043_1664178643652_JzwOo.mp4_1664178673209_large?Expires=1670821015&Signature=ZkZ-kEpZ2YesPeBW~vtS4q-IFWL9s7JEW55sXQe1LRfh4LUjPM0F1iSLyqIv3X1SlXGoWRZrQeYnnzrckL2AssQsj2rYbzzVtfUjBAIYBUVUElaEYC8MF0hdF1NjUMc9BISEvN3UAydvOL9SKyPVoGE7Fk3H7oR7KxDbU~s5JLL8gc1DFfvCWgZ4BajYLaM9Xdffw00Y-0LK871uMx0ofY6H4pF8tC0-TOP~x7QQQJOFThQ9YVMsEZPkyldNI9N5jhZuLhzPC~5~eiCa4CmGpl8qSx9NN-V0h1zgS62eoHxvsfNWwM-OOr9yd8ZJL6R5ONfLZm5Rdu2vW9ztWvBiPw__',
  'LIST_VIDEOS': [
    {
      'id': '1',
      'hlsUrl': 'https://vod.dev2.lunativi.com/vods/4/yCbm6ZXk9kucNJfGzOo0_MEDIA_20230322-093606_1679452566475_LUPIYmp4/playlist.m3u8',
      'videoName': 'y2mate.com - 20 Second Timer Bomb 3D TIMER _1080p.mp4',
      'videoDesc': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book',
      'videoThumbnailUrl': 'https://images.stg.luna.netcoresolutions.net/47/WmAvMuqgoX0SRp1IBTDw_MEDIA_20230328-081954_1679966394854_EWhr0.mp4_1679966434187_large?Expires=1691573090&Signature=RrhJQDytghgZffhMBA2dZQR3QLhQv-k0FuUN3fWlRsSujJHmitDxRJiqk-gOvAQ4yJF9lHet8QKqtYLOs0Hlc4QiFsHanEM9ADeWeIel6wuGj3axwClC7pRRyJDgUGF9rcgxJpKW~M820hkLzEhUAlHsHUmU3YdqKF9LX2tYT6xzuBH4DBW9i3L8B3lFvxf5u2QXEch4VFTXenGrobLtF89PoDFnhbXvfuw0tcvWfK1QDVKqWLURv9K6R8jmqHLa1L7SxIXnfDXMbhp43GgKohBKS7XWJ~T2YH8EHLygimigUs1qdNIUpe7~hd9-kY4-9jyiG289i07tuqH-KJSCpA__&Key-Pair-Id=KLVSNM2JIC065'
    },
    {
      'id': '2',
      'hlsUrl': 'https://upload-stg.cdn.luna.netcoresolutions.net/vods/4/kfwR6oS6PF89NLdKPNQl_MEDIA_20230424-094148_1682304108983_2U7yLmp4/playlist.m3u8',
      'videoName': 'Kandima Signature Video - 20 seconds.mp4',
      'videoDesc': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book',
      'videoThumbnailUrl': 'https://images.stg.luna.netcoresolutions.net/47/WmAvMuqgoX0SRp1IBTDw_MEDIA_20230328-081954_1679966394854_EWhr0.mp4_1679966434187_large?Expires=1691573090&Signature=RrhJQDytghgZffhMBA2dZQR3QLhQv-k0FuUN3fWlRsSujJHmitDxRJiqk-gOvAQ4yJF9lHet8QKqtYLOs0Hlc4QiFsHanEM9ADeWeIel6wuGj3axwClC7pRRyJDgUGF9rcgxJpKW~M820hkLzEhUAlHsHUmU3YdqKF9LX2tYT6xzuBH4DBW9i3L8B3lFvxf5u2QXEch4VFTXenGrobLtF89PoDFnhbXvfuw0tcvWfK1QDVKqWLURv9K6R8jmqHLa1L7SxIXnfDXMbhp43GgKohBKS7XWJ~T2YH8EHLygimigUs1qdNIUpe7~hd9-kY4-9jyiG289i07tuqH-KJSCpA__&Key-Pair-Id=KLVSNM2JIC065'
    },
    {
      'id': '3',
      'hlsUrl': 'https://media.cdn.lunativi.com/vods/2/NmkLNc90CpAKoY7dgxGlpTnIKvwzSamp4/playlist.m3u8',
      'videoName': 'ENGLISH SPEECH _ RISHI SUNAK_ First Speech as U.K. Prime Minister (English Subtitles).mp4',
      'videoDesc': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book',
      'videoThumbnailUrl': 'https://images.stg.luna.netcoresolutions.net/47/WmAvMuqgoX0SRp1IBTDw_MEDIA_20230328-081954_1679966394854_EWhr0.mp4_1679966434187_large?Expires=1691573090&Signature=RrhJQDytghgZffhMBA2dZQR3QLhQv-k0FuUN3fWlRsSujJHmitDxRJiqk-gOvAQ4yJF9lHet8QKqtYLOs0Hlc4QiFsHanEM9ADeWeIel6wuGj3axwClC7pRRyJDgUGF9rcgxJpKW~M820hkLzEhUAlHsHUmU3YdqKF9LX2tYT6xzuBH4DBW9i3L8B3lFvxf5u2QXEch4VFTXenGrobLtF89PoDFnhbXvfuw0tcvWfK1QDVKqWLURv9K6R8jmqHLa1L7SxIXnfDXMbhp43GgKohBKS7XWJ~T2YH8EHLygimigUs1qdNIUpe7~hd9-kY4-9jyiG289i07tuqH-KJSCpA__&Key-Pair-Id=KLVSNM2JIC065'
    },
    {
      'id': '4',
      'hlsUrl': 'https://media.cdn.lunativi.com/vods/2/siOzjuHivCFryckPS7cIXxXWia8XUCmp4/playlist.m3u8',
      'videoName': 'La Vie en Rose - Piano & Vocal Duet ft. Nieka Moss.mp4',
      'videoDesc': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book',
      'videoThumbnailUrl': 'https://images.stg.luna.netcoresolutions.net/47/WmAvMuqgoX0SRp1IBTDw_MEDIA_20230328-081954_1679966394854_EWhr0.mp4_1679966434187_large?Expires=1691573090&Signature=RrhJQDytghgZffhMBA2dZQR3QLhQv-k0FuUN3fWlRsSujJHmitDxRJiqk-gOvAQ4yJF9lHet8QKqtYLOs0Hlc4QiFsHanEM9ADeWeIel6wuGj3axwClC7pRRyJDgUGF9rcgxJpKW~M820hkLzEhUAlHsHUmU3YdqKF9LX2tYT6xzuBH4DBW9i3L8B3lFvxf5u2QXEch4VFTXenGrobLtF89PoDFnhbXvfuw0tcvWfK1QDVKqWLURv9K6R8jmqHLa1L7SxIXnfDXMbhp43GgKohBKS7XWJ~T2YH8EHLygimigUs1qdNIUpe7~hd9-kY4-9jyiG289i07tuqH-KJSCpA__&Key-Pair-Id=KLVSNM2JIC065'
    },
    {
      'id': '5',
      'hlsUrl': 'https://media.cdn.lunativi.com/vods/2/9n37JknPsWVWe2YX4yzuhYPMsXas7emp4/playlist.m3u8',
      'videoName': '✏️ have both description - (video-mkv) [1] Vẽ cảnh bầu trời và hoa lavender đơn giản - HHA ART',
      'videoDesc': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book',
      'videoThumbnailUrl': 'https://images.stg.luna.netcoresolutions.net/47/WmAvMuqgoX0SRp1IBTDw_MEDIA_20230328-081954_1679966394854_EWhr0.mp4_1679966434187_large?Expires=1691573090&Signature=RrhJQDytghgZffhMBA2dZQR3QLhQv-k0FuUN3fWlRsSujJHmitDxRJiqk-gOvAQ4yJF9lHet8QKqtYLOs0Hlc4QiFsHanEM9ADeWeIel6wuGj3axwClC7pRRyJDgUGF9rcgxJpKW~M820hkLzEhUAlHsHUmU3YdqKF9LX2tYT6xzuBH4DBW9i3L8B3lFvxf5u2QXEch4VFTXenGrobLtF89PoDFnhbXvfuw0tcvWfK1QDVKqWLURv9K6R8jmqHLa1L7SxIXnfDXMbhp43GgKohBKS7XWJ~T2YH8EHLygimigUs1qdNIUpe7~hd9-kY4-9jyiG289i07tuqH-KJSCpA__&Key-Pair-Id=KLVSNM2JIC065'
    }
  ]
};

export default DUMMY_URLS;
