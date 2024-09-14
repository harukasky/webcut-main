<template>
  <ul class="textList">
    <li v-for="(item, index) in VideoList" :key="index" @click="$emit('addVideo',item)">
      <img :src="item.cover" alt="">
      <span>{{ item.name }}</span>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { VideoList } from './VideoList';


const emit = defineEmits({
    addVideo: (item: any) => true
})//这边添加的是source文件，是我们给他的
</script>

<style lang="scss" scoped>
.textList {
  display: flex;
  flex-wrap: wrap;

  li {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
    width: 160px;
    height: 200px; /* Increased height to accommodate both image and text */
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
      //max-height: 140px; /* Constrain the image height */
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

  li:nth-child(2n) {
    margin-right: 0;
  }
}
</style>
