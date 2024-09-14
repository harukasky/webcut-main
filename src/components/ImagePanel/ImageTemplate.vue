<!-- <template>
<div>
    <div>
        <span>背景图片</span>
    <el-row :gutter="15">
        <el-col :span="8" v-for="(item,index) in ImageList" :key="index" style="margin-bottom: 10px;">
            <img :src="item.source" >
        </el-col>
    </el-row>
    </div>
    <div>
        <span>前景图片</span>
        <el-row :gutter="15">
            <el-col :span="8" v-for="(item,index) in StickerList" :key="index" style="margin-bottom: 10px;">
                <img :src="item.source">
            </el-col>
        </el-row>
    </div>
</div>
</template>
<script lang="ts" setup>

import { ImageList } from './ImageList';//背景图片
import { StickerList } from './ImageList';//前景图片
</script>

<style scoped lang="scss">
img {
    border-radius: 8px;
    border: 1px white solid;
}

</style> -->


<template>
  <div>
    <div>
      <span>背景图片</span>
      <el-row :gutter="15">
        <el-col
          :span="8"
          v-for="(item, index) in ImageList"
          :key="index"
          class="image-col"
        >
          <img :src="item.source" @click="$emit('addImage', item)" />
        </el-col>
      </el-row>
    </div>
    <div>
      <span>前景图片</span>
      <el-row :gutter="15">
        <el-col
          :span="8"
          v-for="(item, index) in StickerList"
          :key="index"
          class="image-col"
        >
          <img :src="item.source" @click="$emit('addImage', item)" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ImageList, StickerList } from './ImageList';

const emit = defineEmits({
  addImage: (item: any) => true,
});
</script>

<style lang="scss" scoped>
.image-col {
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
}

img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 2px solid white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
    transform: scale(1.05);
  }
}
</style>
