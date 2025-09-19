import { ref } from "vue";
interface Word {
  chinese: string;
  english: string;
  count: string;
}

const words: Word[] = await window.ipcRenderer.invoke('readWords');
//生成一个word[]的索引的乱序数组
const shuffledIndices = Array.from(Array(words.length).keys()).sort(() => Math.random() - 0.5);

let index: number = 0;
let answer: string = '';
let isCorrect: boolean = false;
let currentIndex: number = 0;
const rightAnswer = ref('')

//getQuestion
function getQuestion(isEnglish: boolean) {
  // 检查是否还有问题
  if (index >= shuffledIndices.length) {
    return null; // 没有问题了
  }

  currentIndex = shuffledIndices[index];
  if (isEnglish) {
    let options: string[] = [];
    answer = words[currentIndex].chinese;
    options.push(words[currentIndex].chinese);
    for (; options.length < 4;) {
      let randomIndex = Math.floor(Math.random() * words.length);
      if (!options.includes(words[randomIndex].chinese)) {
        options.push(words[randomIndex].chinese);
      }
    }
    return { question: words[currentIndex].english, options: options }
  } else {
    answer = words[currentIndex].english;
    return { question: words[currentIndex].chinese, options: [] };
  }
}

//judge
function judge(userAnswer: string) {
  if (userAnswer === answer) {
    let right: number = Number(words[currentIndex].count) + 1;
    words[currentIndex].count = right.toString();
    isCorrect = true;
  } else {
    isCorrect = false;
  }
  rightAnswer.value = answer; // 设置正确答案
  index++;
  return isCorrect;
}

function checkWords() {
  // 使用 filter 替代 forEach + splice 以避免遍历时修改数组的问题
  // 保留count小于等于6的单词，移除已经掌握的单词（count>6）
  const filteredWords = words.filter(word => Number(word.count) <= 6);
  // 更新原数组
  words.length = 0;
  words.push(...filteredWords);
  window.ipcRenderer.invoke('writeWords', words);
}

function checkEnoughWords() {
  if (words.length < 4) {
    return false
  } else
    return true
}

// 重置索引函数
function reset() {
  index = 0;
  // 重新生成乱序数组
  shuffledIndices.length = 0;
  shuffledIndices.push(...Array.from(Array(words.length).keys()).sort(() => Math.random() - 0.5));
}



export default { getQuestion, judge, rightAnswer, checkEnoughWords, reset, checkWords };