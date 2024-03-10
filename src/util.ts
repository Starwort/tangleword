export function loadNumFromStorage(key: string, defaultValue: number): number {
    let value = parseInt(window.localStorage[key] || "");
    if (isNaN(value)) {
        value = defaultValue;
    }
    return value;
}

export function formatTime(millis: number) {
    let seconds = Math.floor(millis / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let parts = [];
    if (hours > 0) {
        parts.push(hours.toString().padStart(2, "0"));
    }
    parts.push((minutes % 60).toString().padStart(2, "0"));
    parts.push((seconds % 60).toString().padStart(2, "0"));
    return parts.join(":");
}
export function shiftFocus(by = 1) {
    const inputs = [...document.querySelectorAll("input:not([disabled])")] as HTMLInputElement[];
    const thisInput = inputs.findIndex(
        (e) => e === document.activeElement
    );
    const next = inputs[(thisInput + by + inputs.length) % inputs.length];
    next?.focus();
}

