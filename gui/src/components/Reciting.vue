<template>
    <button @click="back" class="back-button">返回</button>
    <button v-show="isEnglish||showError" @click="speak" class="speak-button"></button>
    <div class="reciting-container">
        <p v-if="qa">{{ qa.question }}</p>
        <p v-else>没有更多问题了</p>
    </div>
    <!-- 错误提示框 -->
    <div v-if="showError" class="error-message">
        <p class="error-text">回答错误！正确答案是：</p>
        <p class="correct-answer">{{ all.rightAnswer.value }}</p>
        <button @click="closeError" class="close-button">我知道了</button>
    </div>
    <!-- 完成提示框 -->
    <div v-if="showComplete" class="complete-message">
        <h2>🎉 恭喜你！</h2>
        <p class="complete-text">已完成所有问题！</p>
        <button @click="goHome" class="home-button">返回首页</button>
    </div>
    <div class="inputAnswers">
        <div v-if="!isEnglish && qa">
            <input type="text" v-model="userAnswer" @keyup.enter="submitAnswer" placeholder="请输入中文的翻译"
                class="answer-input" />
        </div>
        <div v-else-if="qa" class="options-answer">
            <label v-for="option in qa.options" :key="option" class="option"
                :class="{ selected: userAnswer === option }">
                <input type="radio" v-model="userAnswer" :value="option" class="radio-input" />
                <span class="option-text">{{ option }}</span>
            </label>
        </div>
        <button @click="submitAnswer" :disabled="!qa || showComplete" class="submit-button">确定</button>
    </div>
</template>







<script setup lang="ts">
import router from '../router';
import {  ref } from 'vue';
import all from '../composables/word';
import tts from '../composables/tts';

const isEnglish = ref(true);
const userAnswer = ref('');
const isCorrect = ref(false);
const qa = ref(all.getQuestion(isEnglish.value));
const showError = ref(false); // 控制错误提示的显示
const showComplete = ref(false); // 控制完成提示的显示


function speak() {
    if (isEnglish.value && qa.value) {
        tts.speak(qa.value.question);
    } else if (!isEnglish.value && showError.value) {
        tts.speak(all.rightAnswer.value);
    }
}
speak();
// onMounted(speak())
function submitAnswer() {
    // 检查是否有问题
    if (!qa.value) {
        showComplete.value = true;
        return;
    }

    // Process the answer (e.g., send it to the server)
    isCorrect.value = all.judge(userAnswer.value);
    if (!isCorrect.value) {
        // 显示错误提示和正确答案
        showError.value = true;
        speak();
        return; // 不继续执行下一个问题的逻辑
    }
    // 切换到下一个问题
    nextQuestion();
}

function nextQuestion() {
    isEnglish.value = !isEnglish.value; // 切换问题类型
    userAnswer.value = ''; // 清空用户答案
    qa.value = all.getQuestion(isEnglish.value); // 获取新问题

    // 检查是否还有问题
    if (!qa.value) {
        // 当没有更多问题时，检查并移除已掌握的单词
        all.checkWords();
        showComplete.value = true;
    }
    speak();
}

function closeError() {
    showError.value = false;
    nextQuestion(); // 关闭错误提示后继续执行下一个问题的逻辑
}

function goHome() {
    showComplete.value = false;
    all.reset(); // 重置题目索引
    router.push('/'); // 返回首页
}

function back() {
    // Navigate back to the previous page
    router.push('/')
}

</script>







<style scoped>
button {
    outline: none;
}
.reciting-wrapper {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.speak-button {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6a93cb 0%, #a4bfef 100%);
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    z-index: 10;
    background-image: url('../assets/speak.svg');
    background-size: 60% 60%;
    background-repeat: no-repeat;
    background-position: center;
}

.speak-button:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
}

.back-button {
    position: fixed;
    top: 0px;
    left: 0;
    background: linear-gradient(135deg, #6c63ff 0%, #4e46c7 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 50px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    margin-bottom: 20px;
}

.progress-bar {
    width: 100%;
    height: 10px;
    background-color: #e0e0e0;
    border-radius: 5px;
    margin-bottom: 30px;
    overflow: hidden;
}

.progress {
    height: 100%;
    background: linear-gradient(90deg, #42b983, #4facfe);
    border-radius: 5px;
    transition: width 0.3s ease;
}

.card {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 15px;
    padding: 30px;
    margin-bottom: 25px;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.18);
}

.question-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.question-type {
    background: #42b983;
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
}

.question-count {
    color: #7f8c8d;
    font-weight: 600;
}

.reciting-container {
    background: linear-gradient(135deg, #6a93cb 0%, #a4bfef 100%);
    border-radius: 15px;
    padding: 20px 15px;
    margin-bottom: 25px;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
    text-align: center;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.reciting-container p {
    font-size: 1.5rem;
    color: white;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.no-question {
    font-size: 1.2rem;
    color: #e74c3c;
    font-weight: 600;
}

.input-answer {
    margin-bottom: 25px;
}

.answer-input {
    width: 100%;
    padding: 15px 20px;
    font-size: 1.1rem;
    color: #000000;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    outline: none;
    transition: all 0.3s ease;
    background-color: #f8f9fa;
    box-sizing: border-box;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.answer-input:focus {
    border-color: #42b983;
    box-shadow: 0 4px 12px rgba(66, 185, 131, 0.2);
    background-color: #fff;
    transform: translateY(-2px);
}

.answer-input::placeholder {
    color: #95a5a6;
    font-style: italic;
}

.options-answer {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 25px;
}

.option {
    background: #f8f9fa;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    padding: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    color: black;
    position: relative;
}

.option:hover {
    background: #e9ecef;
    border-color: #42b983;
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(66, 185, 131, 0.2);
}

.option.selected {
    background: #42b983;
    border-color: #42b983;
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.option.selected .option-text {
    font-weight: 600;
    color: white;
}

.option-text {
    font-size: 1.1rem;
    font-weight: 500;
    color: black;
    flex-grow: 1;
    text-align: center;
}

.radio-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

.submit-button {
    width: 100%;
    background: linear-gradient(135deg, #6a93cb 0%, #a4bfef 100%);
    color: white;
    border: none;
    padding: 18px;
    border-radius: 12px;
    cursor: pointer;
    font-size: 1.3rem;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(106, 147, 203, 0.4);
    transition: all 0.3s ease;
}

.submit-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(106, 147, 203, 0.6);
}

.submit-button:active {
    transform: translateY(0);
}

.submit-button:disabled {
    background: #bdc3c7;
    box-shadow: none;
    transform: none;
    cursor: not-allowed;
}

.error-message {
    background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
    border-radius: 12px;
    padding: 25px;
    margin: 20px 0;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
    text-align: center;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.error-text {
    font-size: 1.3rem;
    font-weight: 600;
    color: #c0392b;
    margin: 0 0 10px 0;
}

.correct-answer {
    font-size: 1.6rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 15px 0;
    padding: 15px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.close-button {
    background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
    color: white;
    border: none;
    padding: 12px 25px;
    border-radius: 30px;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 600;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    margin-top: 15px;
}

.close-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
}

.close-button:active {
    transform: translateY(0);
}

.complete-message {
    background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
    border-radius: 15px;
    padding: 35px;
    margin: 20px 0;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    text-align: center;
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.complete-message h2 {
    font-size: 2.2rem;
    color: #2c3e50;
    margin: 0 0 15px 0;
}

.complete-text {
    font-size: 1.4rem;
    font-weight: 600;
    color: #3498db;
    margin: 0 0 25px 0;
}

.home-button {
    background: linear-gradient(135deg, #6a93cb 0%, #a4bfef 100%);
    color: white;
    border: none;
    padding: 14px 35px;
    border-radius: 30px;
    cursor: pointer;
    font-size: 1.2rem;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(106, 147, 203, 0.4);
    transition: all 0.3s ease;
}

.home-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(106, 147, 203, 0.6);
}

.home-button:active {
    transform: translateY(-1px);
}

@media (max-width: 600px) {
    .options-answer {
        grid-template-columns: 1fr;
    }

    .reciting-container p {
        font-size: 1.6rem;
    }

    .card {
        padding: 20px;
    }

    .option {
        padding: 15px;
    }
}
</style>