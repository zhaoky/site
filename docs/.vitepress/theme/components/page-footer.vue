<template>
  <footer v-if="!hasSidebar" class="Footer">
    <div class="license">
      Released under the
      <a href="https://github.com/zhaoky/site/blob/main/LICENSE">MIT License</a>. Copyright © 2014-present
      <span class="click-cursor">Korey Zhao</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useSidebar } from 'vitepress/theme';

const { hasSidebar } = useSidebar();
</script>

<style scoped lang="stylus">
.Footer
  z-index var(--vp-z-index-footer)
  border-top 1px solid var(--vp-c-gutter)
  padding 32px 24px
  background-color var(--vp-c-bg)
.license
  line-height 24px
  font-size 14px
  font-weight 500
  color var(--vp-c-text-2)
  text-align center
  .click-cursor
    cursor pointer
    user-select none
.bottom-tips
  width 100%
  display flex
  justify-content center
  align-items center
  font-size 14px
  flex-wrap wrap

.bottom-tips
  .item
    display flex
    align-items center
    /*height 25px*/
    margin-right 8px
    margin-top 8px
    font-weight normal
    text-decoration none

.polic-beian,
.icp-beian
  color var(--vp-c-text-2)
  font-size 14px
.polic-beian-icon
  width 14px
  height 14px

.icp-beian:hover,
.polic-beian:hover
  color var(--vp-c-brand)
</style>
