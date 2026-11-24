const EXEMPT = 'input, textarea, select, output, [data-copyable], [contenteditable="true"]';

/**
 * Lightweight client-side inspection shield for logic-bearing preview zones.
 * Form fields, outputs and explicitly marked copyable text stay selectable so
 * the tools remain usable and accessible.
 */
export function installUiShield(): () => void {
  if (typeof document === 'undefined') return () => undefined;

  const onContextMenu = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    if (!event.target.closest('[data-ui-shield]')) return;
    if (event.target.closest(EXEMPT)) return;
    event.preventDefault();
  };

  const onDragStart = (event: DragEvent) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('[data-ui-shield]')) event.preventDefault();
  };

  document.addEventListener('contextmenu', onContextMenu);
  document.addEventListener('dragstart', onDragStart);
  return () => {
    document.removeEventListener('contextmenu', onContextMenu);
    document.removeEventListener('dragstart', onDragStart);
  };
}
