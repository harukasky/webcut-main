<template>
  <div class="container">
    <!-- 列表视图 -->
    <ul class="textList">
      <li v-for="(item, index) in VoiceList" :key="index" @click="showDetail(item)">
        <img :src="item.cover" alt="">
        <span>{{ item.name }}</span>
      </li>
    </ul>

    <!-- 属性页面 -->
    <div v-if="isDetailView" class="detailView">
      <div class="detailContent">
        <img :src="selectedItem?.cover" alt="">
        <h2>{{ selectedItem?.name }}</h2>
        <el-input placeholder="请输入文字" type="textarea" maxlength="2000" v-model="word" show-word-limit
          :rows="5"></el-input>
        <el-button @click="goBack">返回</el-button>
        <el-button @click="startTTS">生成轨道</el-button>
        <el-button @click="fetchAndPlayAudio(selectedItem?.voice)">试听</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { VoiceList } from './VoiceList'; // 直接使用你定义的 VoiceList 数据
import * as fs from 'fs';
import * as CryptoJS from 'crypto-js';
import { Buffer } from 'buffer';
import { ElMessage } from 'element-plus';


import { usePlayerState } from '@/stores/playerState';
import { useTrackState } from '@/stores/trackState';
import { getMD5 } from '@/class/Base';
import { AudioTrack } from '@/class/AudioTrack';
import { audioDecoder } from '@/utils/webcodecs';

const trackStore = useTrackState();
const playStore = usePlayerState();

const isDetailView = ref(false)
const selectedItem = ref<typeof VoiceList[0] | null>(null)
const word = ref('');



// 显示属性页面
const showDetail = (item: typeof VoiceList[0]) => {

  selectedItem.value = item
  isDetailView.value = true
  console.log(selectedItem.value.vcn);
}

// 返回到列表页
const goBack = () => {
  isDetailView.value = false
  selectedItem.value = null
}


const audioContext = ref<AudioContext | null>(null);
const audioBuffer = ref<AudioBuffer | null>(null);

// 使用 fetch 获取 PCM 数据并播放
const fetchAndPlayAudio = async (voiceUrl: any) => {
  // const url = '/public/test.pcm'; // 替换为实际 PCM 文件的 URL
  try {
    const response = await fetch(voiceUrl);
    const arrayBuffer = await response.arrayBuffer();
    processPCM(arrayBuffer);
    playAudio();
  } catch (error) {
    console.error('获取 PCM 文件失败: ', error);
  }
};

const processPCM = (arrayBuffer: ArrayBuffer) => {//在这边添加相关的处理，添加audio轨道
  const sampleRate = 16000;  // 使用实际 PCM 文件的采样率 16000 Hz
  const numChannels = 1;     // 使用实际的声道数 1（单声道）
  const pcmData = new DataView(arrayBuffer);

  // 将 PCM 数据转换为 Float32Array
  const pcmFloat32Array = new Float32Array(pcmData.byteLength / 2); // 16 位 (2 字节) 转 Float32
  for (let i = 0; i < pcmFloat32Array.length; i++) {
    // 将 16 位有符号整数转换为 Float32 格式
    pcmFloat32Array[i] = pcmData.getInt16(i * 2, true) / 32768;
  }

  const wavBlob = createWavBlob(pcmFloat32Array, sampleRate, numChannels);
  const audioURL = URL.createObjectURL(wavBlob);
  fetchVoiceFromURL(audioURL);


  // 创建 AudioContext
  if (!audioContext.value) {
    audioContext.value = new AudioContext();
  }

  // 创建 AudioBuffer
  audioBuffer.value = audioContext.value.createBuffer(numChannels, pcmFloat32Array.length / numChannels, sampleRate);

  // 将 PCM 数据填充到 AudioBuffer
  for (let channel = 0; channel < numChannels; channel++) {
    const bufferChannel = audioBuffer.value.getChannelData(channel);
    for (let i = 0; i < bufferChannel.length; i++) {
      bufferChannel[i] = pcmFloat32Array[i * numChannels + channel];
    }
  }
};

const createWavBlob = (pcmFloat32Array: Float32Array, sampleRate: number, numChannels: number): Blob => {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;

  const buffer = new ArrayBuffer(44 + pcmFloat32Array.length * 2);
  const view = new DataView(buffer);

  // 1. RIFF chunk descriptor
  writeString(view, 0, 'RIFF'); // ChunkID
  view.setUint32(4, 36 + pcmFloat32Array.length * 2, true); // ChunkSize (文件大小 - 8)
  writeString(view, 8, 'WAVE'); // Format

  // 2. fmt subchunk
  writeString(view, 12, 'fmt '); // Subchunk1ID
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample (16-bit)

  // 3. data subchunk
  writeString(view, 36, 'data'); // Subchunk2ID
  view.setUint32(40, pcmFloat32Array.length * 2, true); // Subchunk2Size (data size)

  // Write the PCM data to the buffer
  let offset = 44;
  for (let i = 0; i < pcmFloat32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, pcmFloat32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true); // PCM 16-bit sample
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
};
const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

async function fetchVoiceFromURL(url: string) {
  try {
    const response = await fetch(url);//blobURL
    if (!response.ok) {
      throw new Error(`无法获取音频文件: ${response.statusText}`);
    }
    const blob = await response.blob();

    const arrayBuffer = await blob.arrayBuffer();
    const id = await getMD5(arrayBuffer);
    const clip = await audioDecoder.decode({ id, stream: blob.stream(), type: blob.type });

    if (!clip) {
      ElMessage.error('解析音频失败');
      return;
    }

    const audioTrack = new AudioTrack({
      id,
      url: url,
      name: selectedItem.value?.name,
      format: blob.type,
      duration: Math.round(clip.meta.duration / 1e6)
    }, playStore.playStartFrame);

    trackStore.addTrack(audioTrack);
    console.log('更新后的 trackStore:', trackStore);
  } catch (error) {
    console.error('读取或处理音频文件时出错:', error);
    ElMessage.error('读取或处理音频文件时出错');
  }
}


const playAudio = () => {
  if (audioBuffer.value && audioContext.value) {
    const source = audioContext.value.createBufferSource();
    source.buffer = audioBuffer.value;
    source.connect(audioContext.value.destination);
    source.start();
  } else {
    console.error('音频缓冲区尚未准备好');
  }
};


const isRequesting = ref(false); // 用于管理按钮的请求状态

// TTS API 配置信息
const config = {
  hostUrl: "wss://tts-api.xfyun.cn/v2/tts",
  host: "tts-api.xfyun.cn",
  appid: "xxxx", // 请填写你自己的appid
  apiSecret: "xxxx", // 请填写你自己的apiSecret
  apiKey: "xxxxx", // 请填写你自己的apiKey
  text: word,
  uri: "/v2/tts"
};

// 用于获取 WebSocket 鉴权签名
function getAuthStr(date: string): string {
  const signatureOrigin = `host: ${config.host}\ndate: ${date}\nGET ${config.uri} HTTP/1.1`;
  const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, config.apiSecret);
  const signature = CryptoJS.enc.Base64.stringify(signatureSha);
  const authorizationOrigin = `api_key="${config.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authStr = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin));
  return authStr;
}

// 用于发送 WebSocket 请求
const startTTS = async () => {
  if (isRequesting.value) return; // 防止重复请求
  isRequesting.value = true;

  const date = new Date().toUTCString();
  const wssUrl = `${config.hostUrl}?authorization=${getAuthStr(date)}&date=${date}&host=${config.host}`;

  const ws = new WebSocket(wssUrl)// 使用浏览器自带的 WebSocket

  ws.onopen = () => {
    console.log("WebSocket 连接成功");
    sendRequest(ws);
  };


  ws.onmessage = (event) => {
    const response = JSON.parse(event.data);
    if (response.code !== 0) {
      console.error(`${response.code}: ${response.message}`);
      ws.close();
      return;
    }

    const audio = response.data.audio;
    const audioBuffer = Buffer.from(audio, 'base64');
    const arrayBuffer = audioBuffer.buffer.slice(audioBuffer.byteOffset, audioBuffer.byteOffset + audioBuffer.byteLength);

    // 将每个音频片段存储到 audioChunks 数组中
    handleAudioBuffer(arrayBuffer);

    if (response.data.status === 2) {
      ws.close();
      playFullAudio();
    }
  };

  ws.onclose = () => {
    console.log("WebSocket 连接关闭");
    isRequesting.value = false;
  };

  ws.onerror = (error) => {
    console.error("WebSocket 错误", error);
    isRequesting.value = false;
  };
};



// 发送 TTS 请求数据
const sendRequest = (ws: WebSocket) => {
  if (config.text.value === "" || config.text.value.trim() === "") {
    ElMessage.error("请输入文字");
    return;
  }
  audioChunks.length = 0;
  const frame = {
    common: { app_id: config.appid },
    business: {
      aue: "raw",
      auf: "audio/L16;rate=16000",
      vcn: selectedItem.value?.vcn,
      tte: "UTF8",
    },
    data: {
      text: Buffer.from(config.text.value).toString('base64'),
      status: 2,
    },
  };
  ws.send(JSON.stringify(frame));
};

const audioChunks: Array<ArrayBuffer> = []; // 保存接收到的音频片段

// 处理音频缓冲区
const handleAudioBuffer = (audioBuffer: ArrayBuffer) => {
  console.log("处理并保存音频缓冲区");

  // 将每个音频片段保存到 audioChunks 数组中
  audioChunks.push(audioBuffer);
};

// 当接收到所有音频片段后，拼接它们并播放
const playFullAudio = () => {
  if (audioChunks.length === 0) {
    console.error("没有音频片段可播放");
    return;
  }

  // 将所有音频片段拼接成一个完整的 ArrayBuffer
  const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const concatenatedBuffer = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of audioChunks) {
    concatenatedBuffer.set(new Uint8Array(chunk), offset);
    offset += chunk.byteLength;
  }

  // 将拼接后的 ArrayBuffer 传递给 processPCM 进行播放
  processPCM(concatenatedBuffer.buffer);

};

</script>

<style lang="scss" scoped>
.container {
  display: flex;
  position: relative;
}

/* 列表样式 */
.textList {
  display: flex;
  flex-wrap: wrap;
  width: 100%;

  li {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
    width: 160px;
    height: 200px;
    background: #f4f4f7;
    border-radius: 4px;
    text-align: center;
    font-weight: 500;
    font-size: 16px;
    margin-right: 8px;
    margin-bottom: 8px;
    cursor: pointer;

    img {
      width: 100px;
      height: 190px;
      object-fit: contain;
      transition: 0.5s;
    }

    span {
      margin-top: 2px;
      font-size: 14px;
      font-weight: bold;
      color: black;
    }

    &:hover::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      z-index: 999;
      border-radius: 4px;
      display: block;
      width: 100%;
      height: 100%;
      border: 1.5px solid #683cfd;
    }
  }
}

/* 属性页面样式，覆盖整个列表 */
.detailView {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 1000;
  /* 确保覆盖其他内容 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.detailContent {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;

  img {
    width: 200px;
    height: auto;
  }

  h2 {
    margin-top: 20px;
    color: black;
  }

  p {
    margin-top: 10px;
    font-size: 14px;
    color: #333;
  }

  button {
    margin-top: 20px;
    padding: 10px 20px;
    font-size: 16px;
    background-color: #683cfd;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
}
</style>
