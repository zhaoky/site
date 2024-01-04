<script setup lang="ts">
import { onBeforeMount, ref, onMounted, onUnmounted } from 'vue';
import { DARK_MODE_BAR_COLOR, LIGHT_MODE_BAR_COLOR } from '../../configs/const';

const offlineReady = ref(false);
const onOfflineReady = () => {
  offlineReady.value = true;
};
const close = async () => {
  offlineReady.value = false;
};

const meta = ref<Element | null>(null);
const media = ref<MediaQueryList | null>(null);

const setMediaColor = async (media: Pick<MediaQueryList, 'matches'>) => {
  const color = media.matches ? DARK_MODE_BAR_COLOR : LIGHT_MODE_BAR_COLOR;
  (meta.value as Element).setAttribute('content', color);
  // isDark.value = media.matches
  // document.documentElement.classList[media.matches ? 'add' : 'remove']('dark')
};

onBeforeMount(async () => {
  const { registerSW } = await import('virtual:pwa-register');
  registerSW({
    immediate: true,
    onOfflineReady,
    onRegistered() {
      console.info('Service Worker registered');
    },
    onRegisterError(e) {
      console.error('Service Worker registration error!', e);
    },
  });
});

onMounted(() => {
  meta.value = document.querySelector('meta[name="theme-color"]');
  media.value = window.matchMedia?.('(prefers-color-scheme: dark)');
  if (!window.matchMedia) return;
  setMediaColor(media.value);
  media.value.addEventListener('change', setMediaColor);
});

onUnmounted(() => {
  if (!window.matchMedia || !media.value) return;
  media.value.removeEventListener('change', setMediaColor);
});
</script>

<template>
  <template v-if="offlineReady">
    <div class="pwa-toast" role="alertdialog" aria-labelledby="pwa-message">
      <div id="pwa-message" class="mb-3">App ready to work offline</div>
      <button type="button" class="pwa-cancel" @click="close">Close</button>
    </div>
  </template>
</template>

<style>
.pwa-toast {
  position: fixed;
  right: 0;
  bottom: 0;
  margin: 16px;
  padding: 12px;
  border: 1px solid #8885;
  border-radius: 4px;
  z-index: 100;
  text-align: left;
  box-shadow: 3px 4px 5px 0 #8885;
  background-color: white;
}

.pwa-toast #pwa-message {
  margin-bottom: 8px;
}

.pwa-toast button {
  border: 1px solid #8885;
  outline: none;
  margin-right: 5px;
  border-radius: 2px;
  padding: 3px 10px;
}
</style>
