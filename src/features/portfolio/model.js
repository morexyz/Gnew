export const PANELS = Object.freeze({
  activity: Object.freeze({ icon: '↗', label: 'ON-CHAIN ACTIVITY', title: 'Understand each step.', description: 'The planned activity view will help users follow relevant wallet transactions and access on-chain records where available.', tags: ['Transaction history', 'Public confirmation', 'Network details'] }),
  permissions: Object.freeze({ icon: '◇', label: 'WALLET PERMISSIONS', title: 'Know what you authorize.', description: 'Understand applicable permissions, see available approval-related information, and use compatible wallet tools to manage approvals.', tags: ['Approval awareness', 'Wallet control', 'Review before signing'] }),
});
export function createPortfolioModel() {
  let current = 'overview';
  return { get tab() { return current; }, setTab(tab) { if (tab === 'overview' || Object.hasOwn(PANELS, tab)) current = tab; } };
}
