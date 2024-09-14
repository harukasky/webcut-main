<template>
  <div class="container">
    <div class="add-text-btn" @click="addTrackItem(TextAttr)">
      <i class="iconfont icon-tianjia_line mr-2" />
      添加文字
    </div>
    <div class="form-container">
      <div class="form-item">
        <el-row>
          <el-col :span="6">字体大小:</el-col>
          <el-col :span="18">
            <el-input class="input" v-model="TextAttr.fontSize" placeholder="请输入字体大小"></el-input>
          </el-col>
        </el-row>
      </div>
      <div class="form-item">
        <el-row>
          <el-col :span="6">字体选择:</el-col>
          <el-col :span="18">
            <el-select class="select" v-model="TextAttr.fontFamily" style="color: black;">
              <el-option label="宋体" value="SimSun"></el-option>
              <el-option label="楷体" value="KaiTi"></el-option>
              <el-option label="黑体" value="SimHei"></el-option>
              <el-option label="Times New Roman" value="Times New Roman"></el-option>
              <el-option label="微软雅黑" value="Microsoft YaHei"></el-option>
            </el-select>
          </el-col>
        </el-row>
      </div>
      <div class="form-item">
        <el-row>
          <el-col :span="6">文本内容:</el-col>
          <el-col :span="18">
            <el-input class="input" v-model="TextAttr.content"></el-input>
          </el-col>
        </el-row>
      </div>
      <div class="form-item">
        <el-row>
          <el-col :span="6">字体颜色:</el-col>
          <el-col :span="18">
            <el-color-picker class="color-picker" v-model="TextAttr.fill" show-alpha></el-color-picker>
            {{ TextAttr.fill }}
          </el-col>
        </el-row>
      </div>
      <div class="form-item">
        <el-row>
          <el-col :span="6">描边颜色:</el-col>
          <el-col :span="18">
            <el-color-picker class="color-picker" v-model="TextAttr.stroke" show-alpha></el-color-picker>
            {{ TextAttr.stroke }}
          </el-col>
        </el-row>
      </div>
      <!-- <div class="form-item">
        <el-row>
          <el-col :span="6">背景颜色:</el-col>
          <el-col :span="18">
            <el-color-picker class="color-picker" v-model="TextAttr.textBackgroundColor" show-alpha></el-color-picker>
            {{ TextAttr.textBackgroundColor }}
          </el-col>
        </el-row>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlayerState } from '@/stores/playerState';
import { useTrackState } from '@/stores/trackState';
import TextTemplate from './TextTemplate.vue';
import { TextTrack } from '@/class/TextTrack';

let TextAttr = reactive({
  fontSize: 24,
  content: '默认文字，测试',
  fontFamily:'Times New Roman',//默认为罗马体
  fill: 'rgba(0,0,0,1)',
  stroke: 'rgba(255,255,255,1)',
  //textBackgroundColor:'rgba(255,255,255,0.5)',
})
//对啊，如果这样的话，我岂不是不能更新自己的背景了？
//多一事不如少一事，直接去掉
const emit = defineEmits({
    addText: (item: any) => true
});

const trackStore = useTrackState();
const playStore = usePlayerState();
function addTrackItem(TextAttr: any) {//ok，现在已经将里面的值传过来了
  console.log(TextAttr);
  trackStore.addTrack(new TextTrack({
    content: TextAttr.content,
    fontSize: TextAttr.fontSize,
    fontFamily: TextAttr.fontFamily,
    fill:TextAttr.fill,
    stroke:TextAttr.stroke,
    textBackgroundColor:TextAttr.textBackgroundColor,
    name: '文本',
  }, playStore.playStartFrame));
  console.log(trackStore);
  //那要怎么样才能实现一个轨道传值呢？
  //通过里面的source文件来实现相关的任务
  // trackStore.addTrack(new TextTrack({//里面的文件内容是写死的还要改成可以变化的
  //   content: '测试',
  //   fontSize: 24,
  //   fontFamily: 'Arial',
  //   name: '文本',
  //   ...style
  // }, playStore.playStartFrame));
  // console.log(trackStore);
}
</script>

<style scoped>
.container {
  padding: 20px;
  background-color: #1e1e1e;
  color: #f0f0f0;
  font-family: 'Arial', sans-serif;
  border-radius: 8px;
}

.add-text-btn {
  background-color: #2b2b2b;
  color: #f0f0f0;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-text-btn:hover {
  background-color: #3d3d3d;
}

.form-container {
  background-color: #2b2b2b;
  padding: 20px;
  border-radius: 8px;
}

.form-item {
  margin-bottom: 15px;
}

.input, .select {
  width: 100%;
  background-color: #1e1e1e;
  color: #f0f0f0;
  border-color: #555;
}

.input::placeholder, .select .el-input__inner::placeholder {
  color: #aaa;
}

.input .el-input__inner, .select .el-input__inner {
  color: #f0f0f0;
  background-color: #2b2b2b;
}

.color-picker {
  margin-top: 10px;
}

.el-color-picker__trigger {
  border-color: #555;
}

.el-row {
  color: #f0f0f0;
}
</style>