export function formatCredits(credits: number) {
  return new Intl.NumberFormat("zh-CN").format(credits);
}

export function canSpendCredits(balance: number, cost: number) {
  return balance >= cost;
}
