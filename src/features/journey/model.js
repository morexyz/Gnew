export const JOURNEY_STEPS = Object.freeze([
  { glyph: '⌁', title: 'Connect your wallet.', description: 'Start with a compatible blockchain wallet. Your assets remain associated with your wallet, not a platform-held trading balance.' },
  { glyph: '◉', title: 'Review your assets.', description: 'See which digital gold-related assets are supported and understand your available wallet balances.' },
  { glyph: '◇', title: 'Review permissions.', description: 'Understand any requested smart-contract approvals before authorizing them. Permissions involve risk and may need to be revoked later.' },
  { glyph: '⌘', title: 'Enable the experience.', description: 'Where available, authorize the intended management experience according to the product’s released functionality.' },
  { glyph: '↗', title: 'Stay informed.', description: 'Review available portfolio information and relevant transaction activity through the planned dashboard and public blockchain records.' },
]);
export function createJourneyModel() {
  let selected = 0;
  return { get index() { return selected; }, get step() { return JOURNEY_STEPS[selected]; }, select(index) { selected = Math.max(0, Math.min(JOURNEY_STEPS.length - 1, index)); }, next() { selected = (selected + 1) % JOURNEY_STEPS.length; } };
}
