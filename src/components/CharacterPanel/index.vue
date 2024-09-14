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
                <el-input placeholder="请输入文字" type="textarea" maxlength="2000" v-model="word" show-word-limit
                    :rows="5"></el-input>
                <el-button @click="goBack">返回</el-button>
            </div>
        </div>
    </div>
</template>


<script lang="ts" setup>
import { CharacterList } from './CharacterList';
const isDetailView = ref(false)
const word = ref('');
const selectedItem = ref<typeof CharacterList[0] | null>(null)
const showDetail = (item: typeof CharacterList[0]) => {

    selectedItem.value = item
    isDetailView.value = true
    console.log(selectedItem.value.vcn);
}

// 返回到列表页
const goBack = () => {
    isDetailView.value = false
    selectedItem.value = null
}
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
</style>
