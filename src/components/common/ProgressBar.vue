<template>
  <div 
    class="kb-progress-track" 
    :style="{ height: height }"
    :class="customClass"
  >
    <div
      class="kb-progress-fill"
      :style="{
        width: `${Math.min(value, 100)}%`,
        backgroundColor: color || 'var(--kb-charcoal)'
      }"
    ></div>
  </div>
</template>

<script setup>
defineProps({
  // 진행률 (0 ~ 100)
  value: {
    type: Number,
    default: 0
  },
  // 높이 (예: '20px'는 예산용, '8px'는 리스트용)
  height: {
    type: String,
    default: '8px'
  },
  // 색상 (지정 안 하면 기본 Charcoal 색상)
  color: {
    type: String,
    default: ''
  },
  // 추가 부트스트랩 유틸리티 클래스
  customClass: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.kb-progress-track {
  width: 100%;
  /* 아까 main.css에 정의한 연한 베이지색 배경 사용 */
  background-color: var(--kb-gray-200); 
  border-radius: 999px;
  overflow: hidden;
  position: relative;
}

.kb-progress-fill {
  height: 100%;
  border-radius: 999px;
  /* 슥- 하고 부드럽게 차오르는 애니메이션 */
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>