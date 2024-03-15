import {Random, select} from "./random";

export type Source = number;
export type Destination = number;
export type ArrowSets = {[key: Source]: readonly Destination[];};
export type MutArrowSets = {[key: Source]: Destination[];};
export const NUM_WORDS = 6;
export const NUM_OUTPUTS = 8;

export function generateArrowSets(random: Random): ArrowSets {
    let arrows: MutArrowSets = {};
    for (let i = 0; i < NUM_WORDS; i++) {
        arrows[i] = [];
    }
    let outputUse = Array.from({length: NUM_OUTPUTS}, () => 0);
    const link = (source: Destination[], dest: Destination) => {
        source.push(dest);
        // sort the destinations to ensure that the answers are in a sensible
        // order
        source.sort((a, b) => a - b);
        outputUse[dest]++;
    };
    // always link the first word to the first output and the last word to the
    // last output. Technically this is not necessary but given that all puzzles
    // need the first and last outputs to be connected, linking them like this
    // ensures that the clue order is more sensible.
    link(arrows[0], 0);
    link(arrows[NUM_WORDS - 1], NUM_OUTPUTS - 1);
    let wordsLeft;
    while ((wordsLeft = Object.values(arrows).filter(a => a.length != 3)).length > 0) {
        let wordToUpdate = select(wordsLeft, random);
        const minOutputUse = Math.min(...outputUse);
        const availableOutputs = outputUse.map((use, i) => use == minOutputUse ? i : -1).filter(i => i !== -1 && !wordToUpdate.includes(i));
        const output = select(availableOutputs, random);
        link(wordToUpdate, output);
    }
    return topologicalSort(arrows);
}

function isBefore(a: readonly Destination[], b: readonly Destination[]): boolean {
    return a.every((a, i) => a <= b[i]) && !a.every((a, i) => a == b[i]);
}

export function topologicalSortOrder(arrows: ArrowSets): Source[] {
    // edges[destination].includes(source) = (source is before destination)
    let edges = Object.entries(arrows).map((): Source[] => []);
    for (let source = 0; source < edges.length; source++) {
        for (let destination = 0; destination < edges.length; destination++) {
            if (isBefore(arrows[source], arrows[destination])) {
                edges[destination].push(source);
            }
        }
    }
    let unplaced: Source[] = Object.keys(arrows).map(val => +val);
    let sorted: Source[] = [];
    // Kahn's algorithm
    while (unplaced.length > 0) {
        // Find a clue with no clues before it in partial-order
        let toPlace = unplaced.findIndex(source => edges[source].length === 0);
        if (toPlace === -1) {
            console.error("No topological solution found;", unplaced.length, "nodes left but no earliest node found", edges);
            return Object.keys(arrows).map(val => +val);
        }
        let source = unplaced.splice(toPlace, 1)[0];
        sorted.push(source);
        // remove all edges from this source
        for (let incomingEdges of edges) {
            let index = incomingEdges.indexOf(source);
            if (index !== -1) {
                incomingEdges.splice(index, 1);
            }
        }
    }
    return sorted;
}

// Sort the clues in topological order, without mutating the original
// Not strictly necessary but it makes the clues look nicer in general
export function topologicalSort(arrows: ArrowSets): ArrowSets {
    let sorted = topologicalSortOrder(arrows);
    // Reconstruct the arrows object in topological order
    let sortedArrows: ArrowSets = {};
    for (let i = 0; i < sorted.length; i++) {
        sortedArrows[i] = arrows[sorted[i]];
    }
    return sortedArrows;
}