export function calcMonthsCovered(totalValueFiat: number, monthlyExpenses: number) {
  if (!Number.isFinite(totalValueFiat) || totalValueFiat <= 0) return 0;
  if (!Number.isFinite(monthlyExpenses) || monthlyExpenses <= 0) return 0;
  return totalValueFiat / monthlyExpenses;
}