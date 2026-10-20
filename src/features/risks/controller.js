export function mountRisks(root) {
  const details = [...root.querySelectorAll('details')];
  details.forEach(item => item.addEventListener('toggle', () => {
    if (!item.open) return;
    details.forEach(other => { if (other !== item) other.open = false; });
  }));
}
