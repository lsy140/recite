<script setup lang="ts">

</script>

<template>
  <div id="app">
    <RouterView />
    <Debug />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
}

body {
  overflow-x: hidden;
}

button {
  transition: all 0.3s ease;
  outline: none;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

button:active {
  transform: translateY(0);
}

button:disabled {
  opacity: 0.6;
  transform: none;
  cursor: not-allowed;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>