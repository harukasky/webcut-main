

export const TrackHeightMap = new Map([
    ['video', 'h-16'],
    ['audio', 'h-12'],
    ['text', 'h-6'],
    ['image', 'h-6'],
    ['effect', 'h-6'],
    ['filter', 'h-6'],
    ['transition', 'h-6'],
    ['character', 'h-6']
]);

export let baseFps = 25;
//应该要让他自适应
//现在自适应播放已经完成，现在就是要处理连续的播放
//应该将这边的进行分离吗？

export function setFPS(fps: number) {
    baseFps = fps;
}


/**
 * 单位帧时间，毫秒
 */
export const UnitFrame2ms = 1e3 / baseFps;
/**
 * 单位帧时间，微秒
 */
export const UnitFrame2μs = 1e6 / baseFps;

export const WaveOptions = {
    height: 28,
    width: '100%',
    splitChannels: false,
    normalize: true,
    waveColor: '#007bff',
    progressColor: '#dd5e98',
    cursorColor: '#ddd5e9',
    cursorWidth: 0,
    barWidth: 1,
    barGap: 1,
    barRadius: 1,
    barHeight: 0.6,
    barAlign: 'bottom',
    minPxPerSec: 1,
    fillParent: true,
    mediaControls: true,
    autoplay: false,
    interact: false,
    dragToSeek: false,
    hideScrollbar: false,
    audioRate: 0.1,
    autoScroll: true,
    autoCenter: true,
    sampleRate: 8000
} as const;