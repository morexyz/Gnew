/** Small pub/sub layer. A component can subscribe without importing its peers. */
export function createEventBus() {
  const channels = new Map();
  return Object.freeze({
    on(event, callback) {
      if (!channels.has(event)) channels.set(event, new Set());
      channels.get(event).add(callback);
      return () => channels.get(event)?.delete(callback);
    },
    emit(event, payload) {
      for (const subscriber of channels.get(event) ?? []) {
        try { subscriber(payload); } catch (error) { console.error(`Event handler failed: ${event}`, error); }
      }
    },
    clear() { channels.clear(); },
  });
}
