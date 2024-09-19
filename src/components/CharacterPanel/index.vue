<template>
    <div class="container">
        <!-- 列表视图 -->
        <ul class="textList">
            <li v-for="(item, index) in CharacterList" :key="index" @click="showDetail(item)">
                <img :src="item.cover" alt="">
                <span>{{ item.name }}</span>
            </li>
        </ul>

        <!-- 属性页面 -->
        <div v-if="isDetailView" class="detailView">
            <div class="detailContent">
                <img :src="selectedItem?.cover" alt="">

                <h2>{{ selectedItem?.name }}</h2>

                <!-- 普通的输入框用于输入文字 -->
                <el-input placeholder="请输入文字" type="textarea" v-model="word" show-word-limit maxlength="2000"
                    :rows="5"></el-input>

                <!-- 选择动作 -->
                <el-select v-model="select" placeholder="请选择动作">
                    <el-option v-for="(item, index) in VideoList" :key="index" :value="item.action" :label="item.name"
                        @click="chooseMove(item.action)"></el-option>
                </el-select>

                <el-button @click="goBack">返回</el-button>
                <el-button @click="submit(selectedItem, word)">提交</el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CharacterList } from './CharacterList';
import { VideoList } from '../VideoPanel/VideoList';
import { useTrackState } from '@/stores/trackState';
import { usePlayerState } from '@/stores/playerState';
import { getMD5 } from '@/class/Base';
import { imageDecoder } from '@/utils/webcodecs';
import { ElMessage } from 'element-plus';
import { CharacterTrack } from '@/class/CharacterTrack';
const select = ref('');
const word = ref(''); // 保存用户的输入文字
const selectedItem = ref<typeof CharacterList[0] | null>(null);
const isDetailView = ref(false);
const wordInput = ref<HTMLTextAreaElement | null>(null); // 用来获取输入框的 DOM 引用
let cursorPosition = 0; // 用来记录光标的位置
const store = useTrackState();
const player = usePlayerState();
const processword = ref('');
const showDetail = (item: typeof CharacterList[0]) => {
    selectedItem.value = item;
    isDetailView.value = true;
};








// 处理文字输入事件


// 选择动作时将其添加到当前输入框的光标位置
const chooseMove = (action: string) => {
    word.value += action;
};

const goBack = () => {
    isDetailView.value = false;
    selectedItem.value = null;
};

const submit = async (selectedItem: any, word: string) => {//但是暂时没有互相匹配的vcn，基础的又没感情，添加轨道

    console.log('提交内容:', word, selectedItem);
    try {
        const start = performance.now();
        const response = await fetch(selectedItem.cover);//反正这边的图片也是按照时间来变的
        if (!response.ok) {
            throw new Error(`无法合成虚拟人:${response.statusText}`)
        }
        const blob = await response.blob();
        console.log('获取到的Blob', blob);
        const arrayBuffer = await blob.arrayBuffer();
        const id = await getMD5(arrayBuffer);
        console.log(`生成md5耗时`, performance.now() - start, 'ms');

        const frames = await imageDecoder.decode({ id, stream: blob.stream(), type: blob.type });

        if (!frames) {
            ElMessage.error('解析图片失败');
            return;
        }

        const characterTrack = new CharacterTrack({
            id,
            url: URL.createObjectURL(blob),
            name: selectedItem.name,
            format: 'png',
            word: word,
            vcn: selectedItem.vcn,//现在的问题就是要怎样才能得到这个时间呢？，我岂不是又要进行处理？跑websocket？
            //duration: 10,
            width: frames[0].codedWidth,
            height: frames[0].codedHeight,
        }, player.playStartFrame);

        characterTrack.resize({ width: player.playerWidth, height: player.playerHeight });
        store.addTrack(characterTrack);
        console.log('更新后的 trackStore', store);
    } catch (error) {//生成图片
        console.log("this is" + error);
    }
};//主要的就是selectedItem里面的人物，声音

function getPCMTime() {//return time

}

function fetchPCMFromAPI() {//从API那边获取相关的PCM

}

function keepInMemory() {//将pcm转化为wav。这样就能知道他说的话的时长，哪怕只有1-2s，这样也是足够的

}

//然后还要能进行播放，转成wav就行了。不用管那么多

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

.word-input {
    display: flex;
    flex-wrap: wrap;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    min-height: 100px;
    background-color: #fff;

    .el-tag {
        margin-right: 5px;
        margin-bottom: 5px;
    }

    span {
        margin-right: 5px;
    }

    textarea {
        flex-grow: 1;
        border: none;
        outline: none;
        resize: none;
        min-height: 100px;
        background-color: transparent;
    }
}
</style>
