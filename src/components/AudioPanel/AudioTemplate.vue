<template>
  <el-row v-for="(item, index) in AudioList" :key="index" :gutter="20" style="margin-bottom: 20px;">
    <el-col :span="22" :offset="1">
      <el-card class="audio-card" shadow="hover" @click="$emit('addAudio', item)">
        <el-row>
          <!-- 图片 -->
          <el-col :span="4">
            <img src="/public/music.png" />
          </el-col>
          <!-- 标题和时间 -->
          <el-col :span="20">
            <div class="audio-info">
              <div class="audio-title">{{ item.name }}</div>
              <div class="audio-duration">{{ item.duration }}</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { AudioList } from './AudioList';


const emit = defineEmits({
  addAudio: (item: any) => true,
});
</script>


<style lang="scss" scoped>
.audio-card {
  padding: 10px;
  /* 减少内边距，压缩高度 */
  transition: all 0.3s ease;
  min-height: 100px;
  /* 设置最小高度 */
}

.audio-card:hover {
  border: 1px solid #409eff;
  /* 鼠标悬浮时显示蓝色边框 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  /* 鼠标悬浮时增加阴影 */
}

.audio-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 15px;
}

.audio-title {
  font-size: 16px;
  /* 调整字体大小 */
  font-weight: bold;
}

.audio-duration {
  font-size: 14px;
  color: #909399;
}

img {
  transition: transform 0.3s ease;
}

img:hover {
  transform: scale(1.05);
  /* 鼠标悬浮时图片放大效果 */
}
</style>
