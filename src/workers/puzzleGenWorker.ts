import {generateFullPuzzleFromSeed, puzzleFromString} from "../puzzle_generator";

onmessage = (event: MessageEvent<string>) => {
    const query = new URLSearchParams(event.data);
    let randomSeed: number;
    let isDaily = true;
    if (query.has("seed")) {
        randomSeed = parseInt(query.get("seed")!);
        if (isDaily = isNaN(randomSeed)) {
            postMessage({kind: 'error', error: "Invalid seed"});
            window.history.replaceState(null, "", window.location.pathname);
            randomSeed = Math.floor(new Date() as any / 8.64e7);
        }
    } else {
        randomSeed = Math.floor(new Date() as any / 8.64e7);
    }
    if (query.has("puzzle")) {
        try {
            return postMessage({kind: 'complete', puzzle: puzzleFromString(query.get("puzzle")!)});
        } catch (_error) {
            let error: Error = _error as any;
            postMessage({kind: 'error', error: error.message});
            window.history.replaceState(null, "", window.location.pathname);
        }
    }
    postMessage({kind: 'complete', puzzle: generateFullPuzzleFromSeed(randomSeed, isDaily)});
};