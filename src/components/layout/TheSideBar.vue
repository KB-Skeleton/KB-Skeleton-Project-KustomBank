<template>
  <aside class="col-12 col-lg-3 col-xl-2">
    <nav class="kb-nav-wrap p-2 d-flex d-lg-block gap-2 overflow-auto">
      <RouterLink
        v-for="item in menu"
        :key="item.to"
        :to="item.to"
        class="kb-nav-item text-nowrap"
        :class="{ 'kb-nav-item-active': route.path === item.to }"
      >
        <span class="me-2">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

// 사이드바 메뉴 구성 데이터
const menu = [
  { label: '홈', to: '/', icon: '🏠' },
  { label: '거래 내역', to: '/monthly-spending', icon: '📝' }, // path 일치 확인
  { label: '고정 지출', to: '/fixed-expenses', icon: '📅' },    // 마이페이지 대신 추가
  { label: '예산 설정', to: '/budget', icon: '💰' },
  { label: '소비 통계', to: '/statistics', icon: '📊' },       // stats -> statistics로 변경
  { label: '투자 현황', to: '/investment', icon: '📈' },       // 라우터에 있는 투자 페이지 추가
];
</script>

<style scoped>
/* 사이드바 감싸는 영역 */
.kb-nav-wrap {
  background-color: white;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  /* 데스크탑에서 높이를 고정하고 싶다면 아래 주석 해제 */
  /* min-height: calc(100vh - 120px); */
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 메뉴 아이템 기본 스타일 */
.kb-nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  text-decoration: none;
  color: var(--kb-charcoal);
  border-radius: 12px;
  transition: all 0.2s ease;
  font-weight: 500;
  margin-bottom: 4px;
}

/* 마우스 올렸을 때 */
.kb-nav-item:hover {
  background-color: #f8f9fa;
  color: var(--kb-brown);
}

/* 활성화된 메뉴 (현재 페이지) */
.kb-nav-item-active {
  background-color: var(--kb-yellow) !important;
  color: var(--kb-charcoal) !important;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(255, 211, 56, 0.3);
}

/* tablet 모드 */
@media (max-width: 991.98px) {
  .kb-nav-wrap {
    justify-content: space-around; /* 아이템 사이 간격을 동일하게 */
  }

  .kb-nav-item {
    margin-bottom: 0;
    padding: 8px 14px;
    font-size: 0.9rem;
    
    /* 6개가 꽉 차게 나누어 갖도록 설정 */
    flex: 1; 
    justify-content: center; /* 아이콘과 글자를 가운데로 */
    min-width: fit-content;
  }
}
@media (max-width: 767.98px) {
  aside {
    margin: 0 !important;
    padding: 0 !important;
    height: 0 !important;
  }
  .kb-nav-wrap {
    /* 화면 하단에 고정 */
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    
    /* 위쪽 모서리만 둥글게, 약간의 그림자 추가 */
    border-radius: 10px 10px 0 0;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
    border: none;
    margin: 0;
    padding: 5px 8px 2px 8px !important; /* 아이폰 하단 바 등을 고려해 여유 공간 확보 */
    
    flex-direction: row;
    overflow-x: auto;

  }

  .kb-nav-item {
    /* 아이콘 위, 글자 아래로 수직 배치 */
    flex-direction: column;
    justify-content: center;
    width: 72px; /* 터치하기 좋은 최소 너비 */
    padding: 6px 4px;
    font-size: 0.75rem;
  }

  /* 부트스트랩의 'me-2'(우측 마진) 속성을 덮어쓰고, 아래쪽 마진으로 변경 */
  .kb-nav-item span:first-child {
    margin-right: 0 !important;
    margin-bottom: 4px;
    font-size: 1.2rem; /* 모바일에서는 아이콘을 살짝 더 크게 */
  }
}
</style>