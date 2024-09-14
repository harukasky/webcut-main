<template>
  <div>
  <div class="p-4 flex-1 overflow-hidden flex flex-col">
    <div class="bg-zinc-200 h-10 flex items-center justify-center rounded text-sm text-gray-900 cursor-pointer" @click="onUpload">
      <i class="iconfont icon-shangchuan_line mr-2" />
      点击上传
    </div>


  </div>
      <div>
      <AudioTemplate @addAudio="SelectedLocalAudio"/>
    </div></div>
</template>

<script setup lang="ts">
  import { usePlayerState } from '@/stores/playerState';
  import { useTrackState } from '@/stores/trackState';
  import { AudioClip } from '@webav/av-cliper';
  import { ElMessage } from 'element-plus';
  import { selectFile } from '@/utils/file';
  import { getMD5 } from '@/class/Base';
  import { AudioTrack } from '@/class/AudioTrack';
  import { audioDecoder } from '@/utils/webcodecs';
import AudioTemplate from './AudioTemplate.vue';

  const selectedMenu = ref('recommend');
  function onSelect(selected: { value: string }) {
    selectedMenu.value = selected.value;
  }

  const trackStore = useTrackState();
  const playStore = usePlayerState();

  async function onUpload() {
    /**
     * TODO: 待优化，有些任务可以并发
     */
    const files = await selectFile({ accept: 'audio/*', multiple: false });

    const id = await getMD5(await files[0].arrayBuffer());

    const clip = await audioDecoder.decode({ id, stream: files[0].stream(), type: files[0].type });

    if (!clip) {
      // 提示解析视频失败
      ElMessage.error('解析音频失败');
      return;
    }

    const audioTrack = new AudioTrack({
      id,
      url: URL.createObjectURL(files[0]),
      name: files[0].name,
      format: files[0].type,
      duration: Math.round(clip.meta.duration / 1e6)
    }, playStore.playStartFrame);

    trackStore.addTrack(audioTrack);
  }




function SelectedLocalAudio(item: any) {
  console.log('Received audio item from child component:', item);
  // 使用 fetch 获取视频文件
  fetchAudioFromSource(item);
}

async function fetchAudioFromSource(item:any) {
  try {
    const start = performance.now();

    // 发起 HTTP 请求获取视频文件
    const response = await fetch(item.source);
    if (!response.ok) {
      throw new Error(`无法获取音频文件: ${response.statusText}`);
    }

    // 将响应转换为 Blob
    const blob = await response.blob();
    console.log('获取到的 Blob:', blob);

    // 生成 MD5 哈希值
    const arrayBuffer = await blob.arrayBuffer();
    const id = await getMD5(arrayBuffer);
    console.log('生成md5耗时', performance.now() - start, 'ms');

    // 使用 audioDecode来解码
    const clip = await audioDecoder.decode({ id, stream: blob.stream(), type: blob.type });

    if (!clip) {
      ElMessage.error('解析音频失败');
      return;
    }

    // 创建 VideoTrack 实例
    const audioTrack = new AudioTrack({
      id,
      url: URL.createObjectURL(blob), // 创建一个指向 Blob 的 URL
      name: item.name,
      format: item.format, // 使用 Blob 的类型
      duration: Math.round(clip.meta.duration / 1e6)
    }, playStore.playStartFrame);

   

    // 将视频轨道添加到 store
    trackStore.addTrack(audioTrack);
    console.log('更新后的 trackStore:', trackStore);
  } catch (error) {
    console.error('读取或处理音频文件时出错:', error);
    ElMessage.error('读取或处理音频文件时出错');
  }
}
</script>

<style scoped>

</style>