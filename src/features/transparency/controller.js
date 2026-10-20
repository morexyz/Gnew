const ITEMS = Object.freeze([
  { label: '01 / USER AUTHORIZATION', title: 'You determine which permissions to grant.', description: 'Wallet permissions can be inspected. Understand approvals before interacting with any smart contract.' },
  { label: '02 / CONFIRMED ON-CHAIN ACTION', title: 'Confirmed activity leaves a public record.', description: 'Blockchain explorers can help independently verify confirmed transactions and relevant execution details.' },
  { label: '03 / WALLET VISIBILITY', title: 'The outcome remains visible to you.', description: 'Where supported, resulting token balances and transaction history can be viewed from your wallet and public chain records.' },
]);
export function mountTransparency(root, bus) {
  const buttons = [...root.querySelectorAll('[data-trace]')];
  const label = root.querySelector('#trace-label'), title = root.querySelector('#trace-title'), description = root.querySelector('#trace-description');
  function select(index) {
    const item = ITEMS[index];
    if (!item) return;
    buttons.forEach((button, i) => { button.classList.toggle('is-current', i === index); button.setAttribute('aria-pressed', String(i === index)); });
    label.textContent = item.label; title.textContent = item.title; description.textContent = item.description;
    bus.emit('ui:select');
  }
  buttons.forEach((button, index) => button.addEventListener('click', () => select(index)));
}
