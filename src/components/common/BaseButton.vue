<template>
  <button
    :type="type"
    :class="computedClasses"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span 
      v-if="loading" 
      class="spinner-border spinner-border-sm me-2" 
      role="status" 
      aria-hidden="true"
    ></span>
    
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // variant: 'dark', 'light', 'fab' 중 선택
  variant: {
    type: String,
    default: 'dark',
    validator: (value) => ['dark', 'light', 'fab', 'danger'].includes(value)
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  // 추가적으로 줄 수 있는 부트스트랩 유틸리티 클래스 (w-100 등)
  customClass: {
    type: String,
    default: ''
  }
});

defineEmits(['click']);

// main.css에 정의된 클래스와 매핑
const computedClasses = computed(() => {
// 1. FAB 버튼일 때
  if (props.variant === 'fab') return 'kb-fab';
  
  // 2. 삭제(danger) 버튼일 때 -> 부트스트랩 내장 클래스 사용
  if (props.variant === 'danger') {
    // btn-danger: 부트스트랩 빨간색
    // rounded-3: 부트스트랩의 둥근 모서리 유틸리티 (0.5rem 정도)
    return 'btn btn-danger rounded-3 fw-bold px-3 py-2'; 
  }

  // 3. 나머지는 네가 만든 커스텀 클래스 (dark, light)
  return `kb-btn-${props.variant} ${props.customClass}`;
});
</script>

<style scoped>
/* 버튼 클릭 시 미세한 피드백 추가 */
button:active:not(:disabled) {
  transform: scale(0.98);
  transition: transform 0.1s;
}
</style>