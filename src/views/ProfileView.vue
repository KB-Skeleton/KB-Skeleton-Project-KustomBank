<template>
  <section class="d-grid gap-3">
    <article class="kb-panel">
      <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
        <div>
          <p class="small fw-semibold text-secondary mb-0">프로필</p>
          <h2 class="h2 fw-black kb-text-charcoal mb-0">홍길동</h2>
          <p class="small text-secondary mb-0">KB 가계부 프리미엄 사용자</p>
        </div>
        <button class="kb-btn-dark">프로필 수정</button>
      </div>
    </article>

    <article class="row g-3">
      <div class="col-12 col-md-6">
        <div class="kb-panel h-100">
          <h3 class="h5 fw-bold kb-text-charcoal mb-3">계정 정보</h3>
          <ul class="list-unstyled d-grid gap-2 small mb-0 text-secondary">
            <li>이메일: hong@example.com</li>
            <li>연락처: 010-1234-5678</li>
            <li>주 사용 은행: KB국민은행</li>
          </ul>
        </div>
      </div>
      <div class="col-12 col-md-6">
        <div class="kb-panel h-100">
          <h3 class="h5 fw-bold kb-text-charcoal mb-3">앱 설정</h3>
          <ul class="list-unstyled d-grid gap-2 small mb-0 text-secondary">
            <li>알림: 지출 초과 시 즉시 알림</li>
            <li>기준 통화: KRW</li>
            <li>리포트 수신: 매주 월요일</li>
          </ul>
        </div>
      </div>
    </article>
  </section>
</template>
