<template>
  <div class="p-4 flex-1 overflow-hidden flex flex-col">
    <div class="bg-zinc-200 h-10 flex items-center justify-center rounded text-sm text-gray-900 cursor-pointer" @click="onUpload">
      <i class="iconfont icon-shangchuan_line mr-2" />
      点击上传
    </div>

    <div class="flex-1 overflow-hidden">
      <div class="overflow-y-auto h-full pt-6 scrollbar-width-none">
        <ImageTemplate @addImage="SelectedLocalImage"/>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
  import { useTrackState } from '@/stores/trackState';
  import { usePlayerState } from '@/stores/playerState';
  import { ElMessage } from 'element-plus';
  import { imageDecoder } from '@/utils/webcodecs';
  import { selectFile } from '@/utils/file';
  import { getMD5 } from '@/class/Base';
  import type { ImageSource } from '@/class/ImageTrack';
import { ImageTrack } from '@/class/ImageTrack';
  import ImageTemplate from './ImageTemplate.vue';

  const trackStore = useTrackState();
const playStore = usePlayerState();



  async function onUpload() {
    // 需要将获取图片文件转换为ImageTractItem
    // 必须：图片的format、height、width、sourceFrame
    // 非必须：cover信息（如果是gif图片）
    const files = await selectFile({ accept: 'image/*', multiple: false });
    const fileBlob = files[0];
    const arrayBuffer = await fileBlob.arrayBuffer();
    const uint8array = new Uint8Array(arrayBuffer);


    const id = await getMD5(await files[0].arrayBuffer());

    const frames = await imageDecoder.decode({ id, stream: files[0].stream(), type: files[0].type });

    if (!frames) {
      // 提示解析视频失败
      ElMessage.error('解析图片失败');
      return;
    }

    // 获取文件相关信息
    const imageSource: ImageSource = {
      id,
      url: id,
      name: files[0].name,
      format: files[0].type,
      width: frames[0].codedWidth,
      height: frames[0].codedHeight,

    };

    // 将文件写入到文件系统
    // 写入原文件，还是写入解码后的文件？
    // write(id, files[0].stream());

    const imageTrack = new ImageTrack(imageSource, playStore.playStartFrame);

    imageTrack.resize({ width: playStore.playerWidth, height: playStore.playerHeight });

    // const url = await uploadFile(files[0]);
    trackStore.addTrack(imageTrack);
    console.log(trackStore);
  }


  function SelectedLocalImage(item: any) {
  console.log('Received video item from child component:', item);
  // 使用 fetch 获取视频文件
  fetchImageFromSource(item);
}

async function fetchImageFromSource(item:any) {
  try {
    const start = performance.now();

    // 发起 HTTP 请求获取视频文件
    const response = await fetch(item.source);
    if (!response.ok) {
      throw new Error(`无法获取图片文件: ${response.statusText}`);
    }

    // 将响应转换为 Blob
    const blob = await response.blob();
    console.log('获取到的 Blob:', blob);

    // 生成 MD5 哈希值
    const arrayBuffer = await blob.arrayBuffer();
    const uint8array = new Uint8Array(arrayBuffer);

    const id = await getMD5(arrayBuffer);
    console.log('生成md5耗时', performance.now() - start, 'ms');

    // 使用 imageDecoder 解码视频
    const frames = await imageDecoder.decode({ id, stream: blob.stream(), type: blob.type });

    if (!frames) {
      ElMessage.error('解析图片失败');
      return;
    }

    // 创建 VideoTrack 实例
    const imageTrack = new ImageTrack({
      id,
      url: URL.createObjectURL(blob), // 创建一个指向 Blob 的 URL
      name: item.name,
      format: item.type, // 使用 Blob 的类型
      width: frames[0].codedWidth,
      height: frames[0].codedHeight,
    }, playStore.playStartFrame);

    // 调整视频轨道大小
    imageTrack.resize({ width: playStore.playerWidth, height: playStore.playerHeight });

    // 将视频轨道添加到 store
    trackStore.addTrack(imageTrack);
    console.log('更新后的 trackStore:', trackStore);
  } catch (error) {
    console.error('读取或处理视频文件时出错:', error);
    ElMessage.error('读取或处理视频文件时出错');
  }
}
</script>

<style scoped>

</style>