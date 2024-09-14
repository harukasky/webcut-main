<template>
  <!-- <ul class="textList">
    <li v-for="(item, index) in templateList" :key="index" @click="$emit('addText', item)">
      <span class="text" :style="calcStyle(item)">花字</span>
    </li>
  </ul> -->
  <div>
    
    <el-row>
      <el-col :span="6">
        字体大小:
      </el-col>
      <el-col :span="18">
        <el-input v-model="TextAttr.fontSize" placeholder="请输入字体大小"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        字体选择:
      </el-col>
      <el-col :span="18">
        <el-select v-model="TextAttr.fontFamily">
          <el-option label="宋体" value="SimSun"></el-option>
          <el-option label="楷体" value="KaiTi"></el-option>
          <el-option label="黑体" value="SimHei"></el-option>
          <el-option label="Times New Roman" value="Times New Roman"></el-option>
          <el-option label="微软雅黑" value="Microsoft YaHei"></el-option>
        </el-select>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        文本内容:
      </el-col>
      <el-col :span="18">
        <el-input v-model="TextAttr.content"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        字体颜色:
      </el-col>
      <el-col :span="18">
        <el-color-picker v-model="TextAttr.fill" show-alpha></el-color-picker>
        {{ TextAttr.fill }}
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        描边颜色:
      </el-col>
      <el-col :span="18">
        <el-color-picker v-model="TextAttr.stroke" show-alpha></el-color-picker>
        {{ TextAttr.stroke }}
      </el-col>
    </el-row>
    <!-- <el-row>
      <el-col :span="6">
        背景颜色:
      </el-col>
      <el-col :span="18">
        <el-color-picker v-model="TextAttr.textBackgroundColor" show-alpha></el-color-picker>
        {{ TextAttr.textBackgroundColor }}
      </el-col>
    </el-row> -->
  </div>
</template>

<script lang="ts" setup>
//明天将这边改造一下，通过里面的处理办法来实现，还有所谓的界面
//然后用emit提交相关属性，让画布修改



import { templateList } from './templateList';
import { ref, reactive } from 'vue';


let TextAttr = reactive({
  fontSize: 40,
  content: '默认文字，测试',
  fontFamily:'Times New Roman',//默认为罗马体
  fill: 'rgba(19,206,102,0.8)',
  stroke: 'rgba(19,206,102,0.8)',
  //textBackgroundColor: 'rgba(0,0,0,0)',
})


  const emit = defineEmits({
    addText: (item: any) => true
  });

  // function calcStyle(item: { fill: string, stroke?: string, textBackgroundColor?: string }) {
  //   const style = { color: item.fill };
  //   const strokeWidth = 2;
  //   const strokeColor = item.stroke;
  //   if (strokeColor) {
  //     style.textShadow = `-${strokeWidth}px -${strokeWidth}px ${strokeColor}, ${strokeWidth}px -${strokeWidth}px ${strokeColor}, -${strokeWidth}px ${strokeWidth}px ${strokeColor}, ${strokeWidth}px ${strokeWidth}px ${strokeColor}`;
  //     // style.textStroke = `${strokeWidth}px ${strokeColor}`;
  //   }
  //   const backgroundColor = item.textBackgroundColor;
  //   if (backgroundColor) {
  //     style.backgroundColor = backgroundColor;
  //   }
  //   return style;
  // }

  // const style = computed(() => {
  //   const strokeWidth = 2;
  //   const strokeColor = 'red';
  //   return {
  //     textShadow: `-${strokeWidth}px -${strokeWidth}px red, ${strokeWidth}px -${strokeWidth}px red, -${strokeWidth}px ${strokeWidth}px red, ${strokeWidth}px ${strokeWidth}px ${strokeColor}`
  //   };
  // });
</script>

<!-- <style lang="scss" scoped>
  .text {
    display: inline-block;
    font-size: 32px;
    border-radius: 8px;
    padding: 8px;
    line-height: 1;
    font-weight: 800;
  }
  .textList {
    display: flex;
    flex-wrap: wrap;

    li {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      width: 105px;
      height: 105px;
      background: #f4f4f7;
      border-radius: 4px;
      text-align: center;
      // line-height: 105px;
      font-weight: 500;
      font-size: 16px;
      margin-right: 8px;
      margin-bottom: 8px;
      cursor: pointer;

      img {
        width: 74px;
        height: 44px;
        object-fit: contain;
        transition: 0.5s;
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

    li:nth-child(3n) {
      margin-right: 0;
    }
  }
</style> -->

<style lang="scss" scoped>



</style>
