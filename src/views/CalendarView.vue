<template>
  <div>
    <CalendarGrid></CalendarGrid>
    <DailyTransactionList
      @open-modal="$emit('open-modal', $event)"
    ></DailyTransactionList>
  </div>
</template>
<script setup>
import CalendarGrid from '@/components/calendar/CalendarGrid.vue';
import DailyTransactionList from '@/components/spending/DailyTransactionList.vue';
defineEmits(['open-modal']);
</script>
