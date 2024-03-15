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
    return arrows;
}