<template>
  <div class="kb-bg">
    <TheHeader />

    <div class="container-xxl py-3">
      <div class="row g-3">
        <TheSideBar />

        <main class="col-12 col-lg-9 col-xl-10 custom-main">
          <RouterView />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";

import TheHeader from "./components/layout/TheHeader.vue";
import TheSideBar from "./components/layout/TheSideBar.vue";
</script>

<style>
.custom-main {
  padding: 24px 24px 60px 24px;
}

@media (max-width: 767.98px) {
  .custom-main {
    padding: 0 16px 80px 16px;
  }
}
</style>
