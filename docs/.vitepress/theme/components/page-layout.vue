<template>
  <Layout>
    <template #layout-bottom>
      <RegisterSW />
    </template>
  </Layout>

  <Footer />
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import RegisterSW from './register-sw.vue';
import Footer from './page-footer.vue';
import { useMediumZoom } from '../../plugins/useMediumZoom';

const { Layout } = DefaultTheme;
useMediumZoom();
</script>
