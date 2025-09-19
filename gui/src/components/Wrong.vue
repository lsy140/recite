<template>
    <div class="wrong-container">
        <div class="card">
            <div class="icon">⚠️</div>
            <h1 class="title">词汇不足</h1>
            <p class="message">words.csv中词汇不足，请手动添加词汇</p>
            <div class="actions">
                <button @click="$router.push('/')" class="back-button">返回首页</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.wrong-container {
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

.icon {
    font-size: 4rem;
    margin-bottom: 20px;
}

.title {
    font-size: 2rem;
    color: #e74c3c;
    margin-bottom: 15px;
    font-weight: 700;
}

.message {
    font-size: 1.2rem;
    color: #7f8c8d;
    margin-bottom: 30px;
    line-height: 1.6;
}

.actions {
    display: flex;
    gap: 15px;
    justify-content: center;
}

.back-button {
    background: linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%);
    color: white;
    border: none;
    padding: 14px 28px;
    border-radius: 50px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    box-shadow: 0 4px 10px rgba(127, 140, 141, 0.4);
}

.add-button {
    background: linear-gradient(135deg, #42b983 0%, #4facfe 100%);
    color: white;
    border: none;
    padding: 14px 28px;
    border-radius: 50px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(66, 185, 131, 0.4);
}

.back-button:hover {
    background: linear-gradient(135deg, #6c7a89 0%, #7f8c8d 100%);
    box-shadow: 0 6px 15px rgba(127, 140, 141, 0.6);
}

.add-button:hover {
    background: linear-gradient(135deg, #369a6f 0%, #3a8fd4 100%);
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

    .actions {
        flex-direction: column;
    }

    .title {
        font-size: 1.7rem;
    }

    .message {
        font-size: 1rem;
    }
}
</style>