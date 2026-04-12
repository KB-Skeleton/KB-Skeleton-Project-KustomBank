import { defineStore } from "pinia";

export const useHotStock = defineStore("hotStock", {
  state: () => ({
    hotStocks: [],
    isFetching: false,
  }),
  actions: {
    async handleFetchStockInfo() {
      if (this.isFetching) return this.hotStocks;
      this.isFetching = true;

      try {
        const res = await fetch("/api/investing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ limit: 5 }),
        });

        if (!res.ok) throw new Error(`Investing API 실패: ${res.status}`);

        const result = await res.json();
        this.hotStocks = (result.stocks || []).slice(0, 5);

        return this.hotStocks;
      } catch (err) {
        console.log("주식 정보 조회 실패 : ", err);
        return this.hotStocks;
      } finally {
        this.isFetching = false;
      }
    },
  },
});
