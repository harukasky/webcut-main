<template>
  <el-container>
    <el-header>MP4Box 解封装与 WebCodecs 解码</el-header>
    <el-main>
      <el-select v-model="selectedCodec" placeholder="选择编码格式" style="margin-bottom: 20px; width: 200px;">
        <el-option label="H264" value="h264"></el-option>
        <!-- <el-option label="H265" value="h265"></el-option> -->
        <el-option label="VP8" value="vp8"></el-option>
        <el-option label="VP9" value="vp9"></el-option>
        <el-option label="AV1" value="av1"></el-option>
      </el-select>

      <el-button @click="onUpload" type="primary" style="margin-bottom: 20px;">选择视频并解码</el-button>

      <canvas ref="videoCanvas" width="300" height="300"></canvas>
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import MP4Box, { MP4ArrayBuffer } from 'mp4box'; 
import { selectFile } from '@/utils/file'; 

// Canvas 元素引用
const videoCanvas = ref<HTMLCanvasElement | null>(null);

// 编码选择器
const selectedCodec = ref<string>('h264');

// 支持的编码器和解码器映射
const codecMapping: { [key: string]: string } = {
  h264: 'avc1.64001f',//h.264是支持的
//   h265: 'hev1',
  vp8: 'vp08',//vp8
  vp9: 'vp09.00.31.08',
  av1: 'av01.0.05M.08 ',
};

// 上传和处理视频文件
async function onUpload() {
  const files = await selectFile({ accept: 'video/*', multiple: false });

  if (files && files.length > 0) {
    const file = files[0];

    if (file.type.includes('video')) {
      await demuxAndDecodeVideo(file, selectedCodec.value);
    } else {
      alert('请上传视频文件');
    }
  }
}

async function demuxAndDecodeVideo(file: File, codec: string) {
  const fileArrayBuffer = await file.arrayBuffer();
  const mp4boxFile = MP4Box.createFile();

  mp4boxFile.onReady = function (info) {
    const videoTrack = info.tracks.find(track => track.type === 'video');
    if (!videoTrack) {
      console.error('找不到视频轨道');
      return;
    }

    let description: Uint8Array | null = null;

    // 检查是否是 H264（avc1）编码，如果是则提取 SPS 和 PPS
    if (codec === 'h264' && videoTrack.codecConfig?.avcC) {
      const sps = videoTrack.codecConfig.avcC.SPS || [];
      const pps = videoTrack.codecConfig.avcC.PPS || [];
      if (sps.length > 0 && pps.length > 0) {
        description = new Uint8Array([...sps[0], ...pps[0]]);
      } else {
        console.error('SPS 或 PPS 不存在');
        return;
      }
    }

    mp4boxFile.setExtractionOptions(videoTrack.id, null);
    mp4boxFile.start();

    mp4boxFile.onSamples = function (id, user, samples) {
      samples.forEach(sample => {
        decodeVideoSample(sample, codec, description);
      });
    };
  };

  const mp4Buffer: MP4ArrayBuffer = fileArrayBuffer as MP4ArrayBuffer;
  mp4Buffer.fileStart = 0;
  mp4boxFile.appendBuffer(mp4Buffer);
}

async function decodeVideoSample(sample: any, codec: string, description: Uint8Array | null) {
  const codecType = codecMapping[codec];

  if (!codecType) {
    console.error(`不支持的编码格式: ${codec}`);
    return;
  }

  const config: VideoDecoderConfig = {
    codec: codecType,
    hardwareAcceleration: 'prefer-hardware' as const,
  };

  if (description) {
    config.description = description; // 仅在 H264 需要时传入 description
  }

  try {
    const support = await VideoDecoder.isConfigSupported(config);

    if (!support.supported) {
      console.error(`编码格式 ${codecType} 不受支持`);
      return;
    }

    const videoDecoder = new VideoDecoder({
      output: (frame) => {
        const ctx = videoCanvas.value?.getContext('2d');
        if (ctx && videoCanvas.value) {
          ctx.clearRect(0, 0, videoCanvas.value.width, videoCanvas.value.height);
          ctx.drawImage(frame, 0, 0, videoCanvas.value.width, videoCanvas.value.height);
          frame.close();
        }
      },
      error: (err) => console.log(`解码错误: ${err}`),
    });

    videoDecoder.configure(config);

    const chunk = new EncodedVideoChunk({
      type: sample.is_sync ? 'key' : 'delta',
      timestamp: sample.cts,
      data: sample.data,
    });

    videoDecoder.decode(chunk);
  } catch (err) {
    console.log(`解码失败: ${err}`);
  }
}




</script>

<style scoped>
canvas {
  margin-top: 20px;
  border: 1px solid black;
}
</style>
