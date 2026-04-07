<template>
  <section class="space-y-5">
    <article class="kb-panel">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">프로필</p>
          <h2 class="text-2xl font-black text-kb-charcoal">홍길동</h2>
          <p class="text-sm text-slate-600">KB 가계부 프리미엄 사용자</p>
        </div>
        <button class="rounded-xl bg-kb-charcoal px-4 py-2 text-sm font-bold text-kb-yellow">프로필 수정</button>
      </div>
    </article>

    <article class="grid gap-4 md:grid-cols-2">
      <div class="kb-panel">
        <h3 class="mb-3 text-lg font-bold text-kb-charcoal">계정 정보</h3>
        <ul class="space-y-2 text-sm text-slate-700">
          <li>이메일: hong@example.com</li>
          <li>연락처: 010-1234-5678</li>
          <li>주 사용 은행: KB국민은행</li>
        </ul>
      </div>
      <div class="kb-panel">
        <h3 class="mb-3 text-lg font-bold text-kb-charcoal">앱 설정</h3>
        <ul class="space-y-2 text-sm text-slate-700">
          <li>알림: 지출 초과 시 즉시 알림</li>
          <li>기준 통화: KRW</li>
          <li>리포트 수신: 매주 월요일</li>
        </ul>
      </div>
    </article>
  </section>
</template>

