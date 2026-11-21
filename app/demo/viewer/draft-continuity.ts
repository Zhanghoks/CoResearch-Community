/**
 * The pinned offline Core composer receives controlled draft props from the
 * parent at the next postMessage turn. Keep the focused native textarea's
 * optimistic value/caret until that echo lands, so a burst of keystrokes
 * doesn't repeatedly start from the last accepted value. This only assists
 * practice input; the Core field and its edit_draft handler still own edits.
 */
export function keepOfflineDraftContinuous(doc: Document) {
  type Edit = { field: HTMLTextAreaElement; value: string; start: number; end: number };
  let edit: Edit | null = null;
  let composing = false;

  function fieldFor(target: EventTarget | null) {
    const field = doc.activeElement;
    return field && field === target && field.matches("textarea[data-demo-anchor=draft]")
      ? field as HTMLTextAreaElement : null;
  }

  function remember(field: HTMLTextAreaElement) {
    edit = { field, value: field.value, start: field.selectionStart, end: field.selectionEnd };
  }

  function beforeInput(event: Event) {
    const input = event as InputEvent;
    const field = fieldFor(event.target);
    if (!field || edit?.field !== field || composing || input.isComposing || field.value === edit.value) return;
    if (!["insertText", "deleteContentBackward", "deleteContentForward"].includes(input.inputType)) return;
    field.value = edit.value;
    field.setSelectionRange(edit.start, edit.end);
  }

  function afterInput(event: Event) {
    const field = fieldFor(event.target);
    if (field && !composing) remember(field);
  }

  function updateSelection() {
    if (edit && doc.activeElement === edit.field && edit.field.value === edit.value) remember(edit.field);
  }
  const onStart = () => { composing = true; edit = null; };
  const onEnd = (event: Event) => { composing = false; afterInput(event); };
  const onBlur = () => { edit = null; composing = false; };

  doc.addEventListener("beforeinput", beforeInput, true);
  doc.addEventListener("input", afterInput, true);
  doc.addEventListener("selectionchange", updateSelection);
  doc.addEventListener("compositionstart", onStart, true);
  doc.addEventListener("compositionend", onEnd, true);
  doc.addEventListener("focusout", onBlur, true);
  return () => {
    doc.removeEventListener("beforeinput", beforeInput, true);
    doc.removeEventListener("input", afterInput, true);
    doc.removeEventListener("selectionchange", updateSelection);
    doc.removeEventListener("compositionstart", onStart, true);
    doc.removeEventListener("compositionend", onEnd, true);
    doc.removeEventListener("focusout", onBlur, true);
    onBlur();
  };
}
