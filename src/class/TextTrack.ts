import { uniqueId } from 'lodash-es';
import type { BaseTractItem, TrackType } from './Base';
import { getTextRect } from '@/utils/common';
import { ImgClip, OffscreenSprite } from '@webav/av-cliper';
import { UnitFrame2μs } from '@/data/trackConfig';

export interface TextSource {//妈的，为什么这边的距离总是调不好。草！
  content: string,
  fill: string,
  stroke?: string,
  fontSize: number,
  fontFamily: string,
  textBackgroundColor?: string,
  name: string
}

export class TextTrack implements BaseTractItem {
  source: TextSource;
  fill: string;
  stroke?: string;
  textBackgroundColor?: string;

  // 影响文本绘制的属性都使用getter/setter
  #fontSize = 24;
  get fontSize() {
    return this.#fontSize;
  }
  set fontSize(value: number) {
    this.#fontSize = value;
    this.calcSize();
  }

  #fontFamily = 'Arial';
  get fontFamily() {
    return this.#fontFamily;
  }
  set fontFamily(value: string) {
    this.#fontFamily = value;
    this.calcSize();
  }

  #content = '';
  get content() {
    return this.#content;
  }
  set content(value: string) {
    this.#content = value;
    this.calcSize();
  }

  constructor(source: TextSource, curFrame: number) {
    this.id = uniqueId();
    this.source = source;
    this.#content = source.content;
    this.fill = source.fill;
    this.stroke = source.stroke;
    this.textBackgroundColor = source.textBackgroundColor;
    this.#fontSize = source.fontSize;
    this.#fontFamily = source.fontFamily;
    this.name = source.name;
    this.format = 'text';
    this.frameCount = 30 * 10;
    this.start = curFrame;
    this.end = this.start + this.frameCount;
    this.centerX = 0;
    this.centerY = 0;
    this.scale = 100;

    this.calcSize();
  }

  calcSize() {
    const { width, height } = getTextRect({
      text: this.#content, fontSize: this.#fontSize, fontFamily: this.#fontFamily
    });
    this.height = height;
    this.width = width;
  }

  get drawWidth() {
    return this.width * this.scale / 100;
  }

  get drawHeight() {
    return this.height * this.scale / 100;
  }

  type: TrackType = 'text';
  centerX = 0;
  centerY = 0;
  scale = 100;
  width = 0;
  height = 0;

  getDrawX(width: number) {
    return width / 2 - this.drawWidth / 2 + this.centerX;
  }

  getDrawY(height: number) {
    return height / 2 - this.drawHeight / 2 + this.centerY;
  }

  drawRoundRect(ctx: OffscreenCanvasRenderingContext2D, { x, y, width, height, radius, color }: { x: number, y: number, width: number, height: number, radius: number, color: string }) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
  }

  draw(ctx: OffscreenCanvasRenderingContext2D, { width, height }: { width: number, height: number }, frameIndex: number) {
    const padding = 4;
    const radius = 4;
    const text = this.content;
    const offsetX = 10;  // 使用相同的偏移量
    const offsetY = 10; // 使用相同的偏移量
    //问题就是，如果这样的话，在字体小的时候，偏移不会太明显
    //但是如果到200px以上，就会开始偏移，直到你看不见

    const drawL = this.getDrawX(width);
    const drawT = this.getDrawY(height);
    const size = this.fontSize * this.scale / 100;
    const color = this.fill;
    const fontFamily = this.fontFamily;
    const strokeColor = this.stroke;
    const strokeWidth = 4;
    const backgroundColor = this.textBackgroundColor;

    const lines = text.split('\n');
    const lineHeight = size * 1.3; // 行高

    const textWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
    const totalHeight = lines.length * lineHeight;

    if (backgroundColor) {
      this.drawRoundRect(ctx, {
        x: drawL - padding,
        y: drawT - padding,
        width: textWidth + padding * 2,
        height: totalHeight + padding * 2,
        radius,
        color: backgroundColor
      });
    }

    ctx.textBaseline = 'top';
    ctx.font = `${size}px ${fontFamily}`;

    lines.forEach((line, index) => {
      const y = drawT + index * lineHeight;

      if (strokeColor && strokeWidth) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.strokeText(line, drawL + offsetX, y + offsetY);
      }

      ctx.fillStyle = color;
      ctx.fillText(line, drawL + offsetX, y + offsetY);
    });

    return Promise.resolve();
  }

  id: string;
  name: string;
  frameCount: number;
  start: number;
  end: number;
  format: string;

  async combine(playerSize: { width: number, height: number }, outputRatio: number) {


    const canvas = new OffscreenCanvas(this.drawWidth, this.drawHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('ctx is null');

    this.draw(ctx, { width: this.drawWidth, height: this.drawHeight }, 0);

    const clip = new ImgClip(await createImageBitmap(canvas));
    await clip.ready;

    const spr = new OffscreenSprite(clip);
    spr.time = { offset: this.start * UnitFrame2μs, duration: this.frameCount * UnitFrame2μs };

    spr.rect.x = this.getDrawX(playerSize.width) * outputRatio;
    spr.rect.y = this.getDrawY(playerSize.height) * outputRatio;
    spr.rect.w = this.drawWidth * outputRatio;
    spr.rect.h = this.drawHeight * outputRatio;


    console.log(spr);

    return spr;
  }
}
