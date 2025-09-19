<script setup lang="ts">
import router from '../router';
import checkEnoughWords from '../composables/all';

function startReciting() {
  if (checkEnoughWords.checkEnoughWords()) {
    router.push('/reciting');
  } else {
    router.push('/wrong');
  }
}
</script>

<template>
  <div class="home-container">
    <div class="card">
      <h1 class="title">背诵单词软件</h1>
      <p class="subtitle">通过科学记忆法高效学习英语单词</p>
      <button @click="startReciting" class="start-button">开始背诵</button>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  width: 100%;
}

.card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  width: 100%;
  max-width: 500px;
  animation: fadeIn 0.6s ease-out;
}

.title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 15px;
  font-weight: 700;
}

.subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 30px;
}

.start-button {
  background: linear-gradient(135deg, #42b983 0%, #42b983 100%);
  color: white;
  border: none;
  padding: 16px 40px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(66, 185, 131, 0.4);
}

.start-button:hover {
  background: linear-gradient(135deg, #369a6f 0%, #369a6f 100%);
  box-shadow: 0 6px 20px rgba(66, 185, 131, 0.6);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .card {
    padding: 30px 20px;
    margin: 0 15px;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }
}
</style>