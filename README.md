# Webcut
 一个实验性质的项目，想试试看浏览器处理音视频的可行性(不过个人推荐还是在后端用ffmpeg来进行处理，webcodecs API当前支持的编解码格式太少)

## 目录结构

```bash
├── coverImage/              #封面
├── public/                  #项目素材文件
├── script/                  #构建脚本
├── src/                     # 项目源代码
│   ├── assets/              # 静态文件   
│   ├── class/               # 在运行的时候需要的类定义
│   ├── components/          # vue组件
│   ├── data/                # 整体界面以及相关的轨道配置
│   ├── hooks/               # 文件hook
│   ├── page/                # 组合起来的总页面
│   ├── plugin/             # 自动注册组件
│   ├── stores/             # 全局变量，以及相关属性(可以传到后端)
│   └── utils/              # 工具包
└── viteUtil/                #服务器代理相关     
```

## 使用技术
- Vue3 - 用于构建用户界面
- Vite - 构建工具
- TypeScript - 定义类型，处理数据
- Element plus - 强大的VUE3组件库
- Sass - 强大的 CSS 预处理器
- Vue Router - 前端路由管理
- Vuex - 用于管理全局状态
- MP4BOX.js - 用于分析音视频数据
- WebAV - 进行图片，文字，音频，视频的解码[借助WebCodecs API]

## 本地安装
1.请使用以下git命令将项目克隆到本地
```bash
https://github.com/harukasky/webcut-main.git
```

2.进入项目目录:
```bash
cd webcut-main
```

3.安装依赖
本人的安装环境为nodejs18，可能会有些许不兼容
```bash
npm install
```

4.开发命令
```bash
npm run dev
```

5.打包项目
```bash
npm run build-only
```

## 提示
如果想要使用tts API来进行合成，请在/src/components/VoicePanel/index.vue里面进行修改，将里面的appid,apiSecret,apiKey替换成你自己的。
这是个实验项目，功能已经基本完成，欢迎各位fork,star,issue

## 灵感来源
- https://github.com/bilibili/WebAV
- https://github.com/x007xyz/fly-cut
- https://github.com/Cc-Edit/CcClip





