<template>
  <label for="inp" class="inp">
    <div class="label-container">
      <span class="url">URL:</span>
    </div>
    <input type="text" id="inp" placeholder="&nbsp;" :value="value">
  </label>
</template>
<script  lang="ts" setup>
const props = defineProps({
  value: String,
});
// const emit = defineEmits(['change']);
</script>
<style>
.inp {
  width: 90%;
  border-radius: 3px;
}
.label-container {
  text-align: left;
}
.url {
  padding: 0 0 0 .7rem;
  font-size: .9rem;
}
.inp input {
  -webkit-appearance: none;
  -moz-appearance: none;
       appearance: none;
  width: calc(100% - 1.4rem);
  height: 2rem;
  border: 0;
  padding: .2rem .7rem;
  font-weight: 400;
  background: rgba(0, 0, 0, 0.02);
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.3);
  color: #000;
  transition: all 0.15s ease;
}
.inp input:hover {
  background: rgba(0, 0, 0, 0.04);
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.5);
}
.inp input:focus {
  background: rgba(0, 0, 0, 0.05);
  outline: none;
  box-shadow: inset 0 -2px 0 #444;
}
</style>