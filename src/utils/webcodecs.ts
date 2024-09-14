

/* eslint-disable */

import type { VideoSource } from "@/class/VideoTrack";
import { baseFps } from "@/data/trackConfig";
import { Combinator, MP4Clip, OffscreenSprite, decodeImg, AudioClip, EmbedSubtitlesClip } from "@webav/av-cliper";
import { file, write, dir } from "opfs-tools";//这个依赖只有3个函数，使用起来很方便
import { UnitFrame2μs } from '@/data/trackConfig';
import { createFile, MP4ArrayBuffer } from "mp4box";
import { ElMessage } from "element-plus";

//import { MP4Box } from 'mp4box';
//const MP4Box = require('../../node_modules/mp4box/dist/mp4box.all.js');
//主要是mp4box在引入方面非常难办，还要还是说在选择视频的时候去运行呢？
//其实还是用mp4clip方便一些
//主要是我们在开发的时候不知道要怎么使用
//浏览器私有个人系统
async function writeFile(id: string, stream?: ReadableStream<Uint8Array>) {//id必选，stream，可选，选中则需要进行文件写入OPFS
  //因为writeFile这边好像是有些格式支持，有些格式不支持
  //这样的话，就能够复用数据，减少消耗
  //检查数据流

  if (!stream) {
    //如果不传递数据流，那么就会通过id去文件系统里面找数据流
    stream = await file(id).stream();

    if (!stream) {
      //如果还是找不到，就是没有
      throw new Error("stream is not ready");
    }
  }

  const start = performance.now()

  // 如果opfs中没有数据则存储
  if (!(await file(id).exists())) {//检查id相对应的文件是否储存在opfs中
    await write(id, stream);//写入文件
    console.log('opfs存储文件耗时', performance.now() - start, 'ms');

    stream = await file(id).stream();//读取文件

    console.log('opfs读取文件耗时', performance.now() - start, 'ms');
  }

  return stream;
}

class VideoDecoder {
  #decoderMap = new Map<string, MP4Clip>();

  #thumbnailsMap = new Map<string, {
    img: Blob;
    ts: number;
  }[]>();//缩略图

  async thumbnails(source: VideoSource) {
    if (this.#thumbnailsMap.has(source.id)) {
      return this.#thumbnailsMap.get(source.id);
    }
    const clip = await this.decode({ id: source.id });

    if (!clip) {
      throw new Error("clip is not ready");
    }

    //clip里面的数据没有问题，但是thumbnails这边运行好像出错了
    const thumbnails = await clip.thumbnails(50, { step: 1e6 });

    this.#thumbnailsMap.set(source.id, thumbnails);

    return thumbnails;
  }//现在已经解决了这边解析错误的问题

  async decode({ id, stream, type }: { id: string, stream?: ReadableStream<Uint8Array>, type?: string }) {//这样的话decode就会返回错误的信息了
    try {//因为clip这边是一定能够进行解析的
      // 检查是否已经存在 decoder，如果存在则直接返回
      if (this.#decoderMap.has(id)) {
        return this.#decoderMap.get(id);
      }

      // 写入文件并返回流
      stream = await writeFile(id, stream);

      // 创建 MP4Clip 实例
      const videoClip = new MP4Clip(stream);

      // 等待 MP4Clip 准备就绪
      await videoClip.ready;
      // 将 videoClip 存入 decoderMap 中
      this.#decoderMap.set(id, videoClip);

      return videoClip;
    } catch (error) {
      // 返回错误信息
      return { success: false, message: `Error decoding video: ${error}` };
    }
  }
  async getFrame(url: string, frameIndex: number) {//获取这个视频一共存在几帧，然后再获得里面的
    let clip = this.#decoderMap.get(url);
    if (!clip) {
      clip = await this.decode({ url })
    }

    // tick根据时间获取帧，可能存在这一时间帧为空的情况，修改为在范围内寻找帧
    // 前几帧可能为空，所以限定最小时间为1/30秒
    //这样的话生成frame的时候会闪动
    let time = Math.max(((frameIndex - 1) / baseFps * 1e6), 1 / 30 * 1e6);
    let video: VideoFrame | undefined;
    const frame = (await (clip as MP4Clip).tick(time));

    return frame.video;
  }

  async getFPS(url: string): Promise<number> {
    try {
      const response = await fetch(url);
      if (response.status !== 200) {
        throw new Error(`Failed to fetch video file: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();

      const mp4boxFile = createFile();

      // Create an MP4ArrayBuffer object
      const mp4ArrayBuffer: MP4ArrayBuffer = Object.assign(
        arrayBuffer, // Create a new ArrayBuffer with the same length
        { fileStart: 0 } // Add the fileStart property
      );

      // Copy the contents of the original ArrayBuffer into the new ArrayBuffer


      return new Promise<number | undefined>((resolve, reject) => {
        mp4boxFile.onReady = (info) => {
          if (info && info.videoTracks.length > 0) {
            const videoTrack = info.videoTracks[0];
            const fps = Math.round(info.videoTracks[0].timescale / (info.videoTracks[0].samples_duration / info.videoTracks[0].nb_samples));
            resolve(fps);
          } else {
            resolve(undefined);
          }
        };

        mp4boxFile.onError = (error) => {
          reject(new Error(`MP4Box error: ${error}`));
        };

        mp4boxFile.appendBuffer(mp4ArrayBuffer);
        mp4boxFile.flush();
      });
    } catch (error) {
      console.error('Error fetching or processing video:', error);
      return undefined;
    }
  }


}

class ImageDecoder {
  #decoderMap = new Map<string, VideoFrame[]>();
  async decode({ id, stream, type }: { id: string, stream?: ReadableStream<Uint8Array>, type?: string }) {
    console.log("🚀 ~ ImageDecoder ~ decode ~ id:", id)

    if (this.#decoderMap.has(id)) {
      return this.#decoderMap.get(id);
    }

    stream = await writeFile(id, stream);

    if (!type) {
      throw new Error("type is not ready");
    }

    // 接收的数据可能是远程数据（URL），也可能是本地数据（file）
    // 如果是远程数据，可以直接使用URL作为source，
    // 如果是本地数据，可以使用FileReader读取数据，然后使用URL.createObjectURL创建URL作为source，但是这样缓存数据没法还原为File对象
    // 要解决这个问题，可以引入https://hughfenghen.github.io/posts/2024/03/14/web-storage-and-opfs/
    // 但是这样会增加复杂度，所以暂时不考虑，
    // TODO: 使用OPFS解决本地数据问题
    const frames = await decodeImg(
      stream,
      type,
    );

    // 存储解析后的帧
    this.#decoderMap.set(id, frames);

    return frames;
  }
  async getFrame(type: string, url: string, frameIndex: number) {
    let frames = this.#decoderMap.get(url);
    if (!frames) {
      await this.decode({ url, type });
      frames = this.#decoderMap.get(url);
    }
    return frames?.[frameIndex % frames.length];
  }
}


// class TextDecoder{//解码srt字幕文件
//   #decoder = new Map<string, EmbedSubtitlesClip>();
//   async decode({ id, stream, type }: { id: string, stream?: ReadableStream<Uint8Array>, type?: string }) {

//   }
// }

class AudioDecoder {
  #decoderMap = new Map<string, AudioClip>();
  async decode({ id, stream, type }: { id: string, stream?: ReadableStream<Uint8Array>, type?: string }) {

    if (this.#decoderMap.has(id)) {
      return this.#decoderMap.get(id);
    }

    stream = await writeFile(id, stream);

    if (!type) {
      throw new Error("type is not ready");
    }

    const clip = new AudioClip(stream);

    if (!clip) {
      // 提示解析视频失败
      throw new Error("解析视频失败");
    }

    await clip.ready;

    this.#decoderMap.set(id, clip)

    return clip;
  }
}

export const splitClip = async (source: IClip, { offsetL, offsetR, frameCount }: { offsetL: number, offsetR: number, frameCount: number }) => {
  if (offsetL === 0 && offsetR === 0) {
    return source
  }
  const start = offsetL * UnitFrame2μs
  // 使用start裁剪视频
  const clip = offsetL === 0 ? source : (await source.split(start))[1];
  const end = (frameCount - offsetR - offsetL) * UnitFrame2μs;
  return offsetR === 0 ? clip : (await clip.split(end))[0];
}

export const videoDecoder = new VideoDecoder();

export const imageDecoder = new ImageDecoder();

export const audioDecoder = new AudioDecoder();