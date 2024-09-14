<template>
  <div class="p-4 flex-1 overflow-hidden flex flex-col">
    <div class="bg-zinc-200 h-10 flex items-center justify-center rounded text-sm text-gray-900 cursor-pointer" @click="onUpload">
      <i class="iconfont icon-shangchuan_line mr-2" />
      点击上传
    </div>

    <div class="flex-1 overflow-hidden">
      <div class="overflow-y-auto h-full pt-6 scrollbar-width-none">
        <VideoTemplate  @addVideo="SelectedLocalVideo"/>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
  import { usePlayerState } from '@/stores/playerState';
  import { useTrackState } from '@/stores/trackState';
  import { videoDecoder } from '@/utils/webcodecs';
  import { ElMessage } from 'element-plus';
  import { selectFile } from '@/utils/file';
  import { getMD5 } from '@/class/Base';
import { VideoSource, VideoTrack } from '@/class/VideoTrack';
import { TextTrack } from '@/class/TextTrack';
import VideoTemplate from './VideoTemplate.vue';
import { templateList } from '../TextPanel/templateList';
import { arrayBuffer } from 'stream/consumers';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { file, write, dir } from "opfs-tools";
import { setFPS } from '@/data/trackConfig';

//主要是这样的话怎么转码呢？要不就是统一回传到后端进行转码处理，然后返回前端来处理，这样的话速度应该不会太慢
//然后是动作相关的


  const trackStore = useTrackState();
const playStore = usePlayerState();
// function addTrackItem(style: { fill: string, stroke?: string, textBackgroundColor?: string }) {

//   trackStore.addTrack(new VideoTrack({
//     content: '文本内容',
//     fontSize: 24,
//     fontFamily: 'Arial',
//     name: '文本',
//     ...style
//   }, playStore.playStartFrame));
// }

// async function transCode(inputFile: File): Promise<Blob | null> {//需要进行转码
//   const ffmpeg = createFFmpeg({ log: true });
//   try {
//     await ffmpeg.load();
//     const fileName = inputFile.name;
//     const fileArrayBuffer = await inputFile.arrayBuffer();
//     const fileBuffer = new Uint8Array(fileArrayBuffer);

//     ffmpeg.FS('writeFile', fileName, fileBuffer);

//     await ffmpeg.run(
//       '-i', fileName,
//       '-c:v', 'libx264',
//       '-c:a', 'acc',
//       `outputTest.mp4`
//     );

//     const output = ffmpeg.FS('readFile', 'outputTest.mp4');

//     const blob = new Blob([output.buffer], { type: 'video/mp4' });

//     return blob;
//   }catch (error) {
//     console.error('转码失败', error);
//     ElMessage.error('转码失败');
//     return null; 
//   }
// }

//   async function onUpload() {
//     // 需要将获取图片文件转换为ImageTractItem
//     // 必须：图片的format、height、width、sourceFrame
//     // 非必须：cover信息（如果是gif图片）
//     //现在问题就是，为什么会失帧呢？他是按照基本标准来算的
//     //认定的帧率为30fps，但是我给的是25fps
//     const files = await selectFile({ accept: '.mp4', multiple: false });//视频指定为MP4，不支持多选
//     const start = performance.now();
//     // TODO：生成md5时间，已经大于解析视频时间，需要优化
//     const id = await getMD5(await files[0].arrayBuffer());
//     console.log('生成md5耗时', performance.now() - start, 'ms');
//     const clip = await videoDecoder.decode({ id, stream: files[0].stream(), type: files[0].type });//将选择的文件转换为stream流，解码
//     console.log('解析视频耗时', performance.now() - start, 'ms');//但是问题是这边要怎么做呢？


//     if (!clip) {
//       // 提示解析视频失败
//       ElMessage.error('解析视频失败');
//       return;
//     }

//     const videoTrack = new VideoTrack({//这边就是创建了一个环境，现在要怎么办呢
//       id,
//       url: URL.createObjectURL(files[0]),//转化成blob了，我在本地的文件也应该转化为blob，这样就好访问了，但是为什么会闪烁呢？
//       name: files[0].name,
//       format: files[0].type,
//       width: clip.meta.width,
//       height: clip.meta.height,
//       duration: Math.round(clip.meta.duration / 1e6)//为什么呢，解码不出来
//     }, playStore.playStartFrame);




//     videoTrack.resize({ width: playStore.playerWidth, height: playStore.playerHeight });
//     trackStore.addTrack(videoTrack);


//     console.log(trackStore);
// };
async function transCodeByWebCodecs(inputFile:File,targetCodec:string) {//核心就是将传回来的stream流进行处理，然后进行再进行encode输出
  
}
async function transCode(inputFile: File): Promise<Blob | null> {//这边的id和clip是绑定的，他们两个要相对应才能跑出来添加轨道
  const ffmpeg = createFFmpeg({ log: true });
  //ffmpeg太慢了，60s的视频转码需要150s
  try {
    await ffmpeg.load();
    const fileName = inputFile.name;
    const fileArrayBuffer = await inputFile.arrayBuffer();
    const fileBuffer = new Uint8Array(fileArrayBuffer);

    // 写入文件到 FFmpeg 的虚拟文件系统
    ffmpeg.FS('writeFile', fileName, fileBuffer);

    // 执行 FFmpeg 转码命令
    //现在做转码，然后生成blob已经能够实现了
    await ffmpeg.run(
      '-i', fileName,
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-r', '30',
      'outputTest.mp4'
    );//还是保持当前状态吧，不然转码出来的文件他又不满意
    //现在我也要获取里面的mp4信息

    // 从 FFmpeg 虚拟文件系统中读取转码后的文件
    const output = ffmpeg.FS('readFile', 'outputTest.mp4');

    // 创建 Blob 对象
    const blob = new Blob([output.buffer], { type: 'video/mp4' });
    return blob;
  } catch (error) {
    console.error('转码失败', error);
    ElMessage.error('转码失败');
    return null;
  }
}

async function onUpload() {
  const files = await selectFile({ accept: '.mp4', multiple: false });
  if (files.length === 0) {
    ElMessage.error('未选择任何文件');
    return;
  }

  const inputFile = files[0];
  const start = performance.now();
  
  const id = await getMD5(await inputFile.arrayBuffer());

  
  // 首先使用原始文件进行解码
  const clip = await videoDecoder.decode({ id, stream: inputFile.stream(), type: inputFile.type });
  console.log(clip);
  const fps = await videoDecoder.getFPS(URL.createObjectURL(inputFile));
  setFPS(fps);
  // 如果视频的宽高是 0，说明文件可能需要转码
  if (clip.meta.width === 0 || clip.meta.height === 0) {
    // 转码文件
    const transCodedBlob = await transCode(inputFile);
    if (transCodedBlob) {
      const transCodedURL = URL.createObjectURL(transCodedBlob); // 转码后的 URL
      const transCodedFile = new File([transCodedBlob], 'transcoded.mp4', { type: 'video/mp4' });
      
      // 转码后重新解码视频
      const transCodedId = await getMD5(await transCodedFile.arrayBuffer());
      let clip = await videoDecoder.decode({ id: transCodedId, stream: transCodedFile.stream(), type: transCodedFile.type });

      if (!clip) {
        ElMessage.error('转码后的视频解码失败');
        return;
      }

      // 更新 VideoSource
      const VideoSource: VideoSource = {
        id: transCodedId,
        url: transCodedURL,
        name: transCodedFile.name,
        format: transCodedFile.type,
        width: clip.meta.width,
        height: clip.meta.height,
        duration: Math.round(clip.meta.duration / 1e6)
      };

      console.log(VideoSource);
      const videoTrack = new VideoTrack(VideoSource, playStore.playStartFrame);
      videoTrack.resize({width: playStore.playerWidth, height:playStore.playerHeight });
      trackStore.addTrack(videoTrack);

      ElMessage.success('视频已成功转码并处理');
    } else {
      ElMessage.error('视频转码失败');
      return;
    }
  } else {
    // 使用原始视频文件的 VideoSource
    const VideoSource: VideoSource = {
      id,
      url: URL.createObjectURL(inputFile), // 原始视频的 URL
      name: inputFile.name,
      format: inputFile.type,
      width: clip.meta.width,
      height: clip.meta.height,
      duration: Math.round(clip.meta.duration / 1e6)
    };

    console.log(VideoSource);
    const videoTrack = new VideoTrack(VideoSource, playStore.playStartFrame);
    videoTrack.resize({ width: playStore.playerWidth, height: playStore.playerHeight });
    trackStore.addTrack(videoTrack);
  }//这边只是添加到轨道里面，轨道怎么渲染还是要按照

  console.log('视频上传处理耗时', performance.now() - start, 'ms');

  console.log(trackStore);//现在要怎么办呢？要进行转码，mp4clip指望不上
};
function SelectedLocalVideo(item: any) {
  console.log('Received video item from child component:', item);
  // 使用 fetch 获取视频文件
  fetchVideoFromSource(item);
}

async function fetchVideoFromSource(item:any) {
  try {
    const start = performance.now();

    // 发起 HTTP 请求获取视频文件
    const response = await fetch(item.source);
    if (!response.ok) {
      throw new Error(`无法获取视频文件: ${response.statusText}`);
    }

    // 将响应转换为 Blob
    const blob = await response.blob();


    // 生成 MD5 哈希值
    const arrayBuffer = await blob.arrayBuffer();
    const id = await getMD5(arrayBuffer);
    console.log('生成md5耗时', performance.now() - start, 'ms');

    // 使用 videoDecoder 解码视频
    const clip = await videoDecoder.decode({ id, stream: blob.stream(), type: blob.type });
    console.log('解析视频耗时', performance.now() - start, 'ms');
    console.log('解码后的 clip:', clip);

    if (!clip) {
      ElMessage.error('解析视频失败');
      return;
    }
      const fps = await videoDecoder.getFPS(URL.createObjectURL(blob));
      setFPS(fps);

    // 创建 VideoTrack 实例
    const videoTrack = new VideoTrack({
      id,
      url: URL.createObjectURL(blob), // 创建一个指向 Blob 的 URL
      name: item.name,
      format: blob.type, // 使用 Blob 的类型
      width: clip.meta.width,
      height: clip.meta.height,
      duration: Math.round(clip.meta.duration / 1e6)
    }, playStore.playStartFrame);

    // 调整视频轨道大小
    videoTrack.resize({ width: playStore.playerWidth, height: playStore.playerHeight });

    // 将视频轨道添加到 store
    trackStore.addTrack(videoTrack);
    console.log('更新后的 trackStore:', trackStore);
  } catch (error) {
    console.error('读取或处理视频文件时出错:', error);
    ElMessage.error('读取或处理视频文件时出错');
  }
}
// function addTrackItem(style: { fill: string, stroke?: string, textBackgroundColor?: string }) {
//   //这个理论是可行的，现在就是要确定，里面传进去的值要是正确的
//   //那要怎么样才能实现一个轨道传值呢？
//   //里面的文件内容是写死的还要改成可以变化的
//   //里面的ID要怎么处理呢？
//   trackStore.addTrack(new VideoTrack({
//     id: 'test',
//     url: '',
//     name: '',
//     format: '',
//     duration: ,
//     width: playStore.playerWidth,
//     height:playStore.playerHeight,
    
//   }, playStore.playStartFrame));
// };
</script>

<style scoped>

</style>