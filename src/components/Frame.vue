<template>
  <div class="header-container">
    <h1 class="header-title">gifp</h1>
    <div class="header-subtitle"><span>simple online gif player</span></div>
  </div>
  <a href="https://github.com/kena0ki/gifp" target="_brank">
    <img class="gh-ribbon" src="../assets/forkme_right_red_aa0000.svg">
  </a>
  <div class="main-area">
    <App />
  </div>
  <div class="footer-container">
    <div class="footer">Made by 
      <a href="https://github.com/kena0ki" target="_brank">
        kena0ki
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import App from './App.vue';

export default defineComponent({
  name: 'Frame',
  components: {
    App
  }
});
</script>

<style>
.header-container {
  width: 100%;
  padding: .5rem 0;
  background-color: white;
  box-shadow: inset 0 0 3rem rgba(0, 0, 0,.1);
  text-align: center;
}
.header-title {
  margin: auto .5rem;
}
.header-subtitle {
  width: 100%;
}

.main-area {
  overflow: auto;
  width: 100%;
  flex-grow: 1;
  text-align: center;
  align-items: center;
}

.footer-container {
  width: 100%;
  background-color: white;
  box-shadow: inset 0 0 3rem rgba(0, 0, 0,.1);
  padding: .5rem 0;
  display: flex;
  justify-content: end;
}
.footer {
  margin: 0 1rem;
  display: block;
}

.gh-ribbon {
  display: block;
  width: 90px;
  height: 90px;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1;
}
</style>
