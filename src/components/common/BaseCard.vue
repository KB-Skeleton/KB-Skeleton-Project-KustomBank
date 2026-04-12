<template>
  <component
    :is="tag"
    :class="computedClasses"
    v-bind="tag === 'button' ? { type: 'button' } : {}"
    @click="$emit('click', $event)"
  >
    <header v-if="label || $slots.header" class="mb-1">
      <slot name="header">
        <p class="kb-card-label m-0">{{ label }}</p>
      </slot>
    </header>

    <div class="kb-card-body">
      <slot />
    </div>

    <footer
      v-if="$slots.footer"
      class="mt-2 pt-2 border-top border-light-subtle"
    >
      <slot name="footer" />
    </footer>
  </component>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  // accent: 'blue', 'red', 'yellow', 'brown' 중 선택 (왼쪽 바 색상)
  accent: {
    type: String,
    default: "",
  },
  // true면 kb-panel 스타일, false면 kb-card 스타일
  isPanel: {
    type: Boolean,
    default: false,
  },
  // 간단한 제목 라벨
  label: {
    type: String,
    default: "",
  },
  // 렌더링할 태그 (article, button, div 등)
  tag: {
    type: String,
    default: "article",
  },
  type: {
    type: String,
  },
  // 추가 부트스트랩 클래스
  customClass: {
    type: String,
    default: "",
  },
});

defineEmits(["click"]);

const computedClasses = computed(() => {
  const baseClass = props.isPanel ? "kb-panel" : "kb-card";
  const accentClass = props.accent ? `kb-card-accent-${props.accent}` : "";
  const clickableClass =
    props.type === "button" || props.accent === "brown" ? "kb-clickable" : "";

  // 모든 클래스를 하나로 합쳐서 반환
  return `${baseClass} ${accentClass} ${clickableClass} ${props.customClass}`.trim();
});
</script>

<style scoped>
/* 버튼으로 사용될 때 스타일 초기화 */
button.kb-card,
button.kb-panel {
  border: 1px solid rgba(34, 34, 34, 0.1);
  background: white;
  width: 100%;
  text-align: left;
  appearance: none;
  display: block;
}

/* 클릭 가능한 카드에만 살짝 피드백 */
.kb-clickable {
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.kb-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.kb-clickable:active {
  transform: scale(0.99);
}
</style>
