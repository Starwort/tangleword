import {ArrowSets, MutArrowSets, generateArrowSets} from "./arrow_sets";
import {DICTIONARY} from "./dictionary";
import {Random, makeRandom, shuffle} from "./random";

export function hash(input: string): string {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0, ch; i < input.length; i++) {
        ch = input.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, "0");
}

function backtrack(clues: string[], arrows: ArrowSets, random: Random, answer: string[]): boolean {
    if (clues.length === Object.keys(arrows).length) {
        return true;
    }
    let source = clues.length;
    let targets = arrows[source];
    let origAnswer = targets.map(i => answer[i]).join("");
    let pattern = new RegExp(origAnswer);
    let options = DICTIONARY.filter(([word, category]) => {
        return !clues.includes(category) && pattern.test(word);
    });
    shuffle(options, random);
    for (let [word, category] of options) {
        clues.push(category);
        for (let i = 0; i < word.length; i++) {
            answer[targets[i]] = word[i];
        }
        if (backtrack(clues, arrows, random, answer)) {
            return true;
        }
        clues.pop();
    }
    for (let i = 0; i < origAnswer.length; i++) {
        answer[targets[i]] = origAnswer[i];
    }
    return false;
}

function generatePuzzle(arrows: ArrowSets, random: Random): [string[], number, string] {
    const uniqueOutputs = new Set<number>();
    for (const source in arrows) {
        for (const destination of arrows[source]) {
            uniqueOutputs.add(destination);
        }
    }
    let clues: string[] = [], answer = Array.from(uniqueOutputs).sort().map(_ => ".");
    if (!backtrack(clues, arrows, random, answer)) {
        console.log(arrows, clues, answer);
        throw new Error("Failed to generate puzzle");
    }
    if (answer.includes(".")) {
        throw new Error("Failed to fill in all outputs");
    }
    return [clues, uniqueOutputs.size, hash(answer.join(""))];
}

export function generateFullPuzzleFromSeed(seed: number, isDaily: boolean): PuzzleData {
    const random = makeRandom(seed);
    let arrows;
    while (true) {
        arrows = generateArrowSets(random);
        try {
            const [clues, outputCount, answerHash] = generatePuzzle(arrows, random);
            return {
                arrows,
                clues,
                outputCount,
                answerHash,
                generatedFromSeed: true,
                randomSeed: seed,
                isDaily,
            };
        } catch (error) {
            console.warn(error);
        }
    }
}

function isSubset<T>(a: Iterable<T>, b: Set<T>): boolean {
    for (let elem of a) {
        if (!b.has(elem)) {
            return false;
        }
    }
    return true;
}

export function puzzleFromString(input: string): PuzzleData {
    const uniqueOutputs = new Set<number>();
    const arrows: MutArrowSets = {};
    const parts = input.split(";");
    const answer = parts.pop();
    if (answer === undefined) throw new Error("Invalid input; missing answer");
    if (!isSubset(answer, new Set("0123456789abcdefABCDEF"))) throw new Error("Invalid input; corrupted answer data");
    let clues = [];
    for (let i = 0; i < parts.length; i++) {
        let part = parts[i].split(",");
        arrows[i] = [];
        let clue = part.shift();
        if (clue === undefined) throw new Error("Invalid input; empty part");
        clues.push(clue);
        for (let target of part) {
            let targetIdx = parseInt(target);
            if (isNaN(targetIdx)) throw new Error("Invalid input; target is not a number");
            if (targetIdx < 0) throw new Error("Invalid input; target is negative");
            uniqueOutputs.add(targetIdx);
            if (targetIdx <= Math.max(...arrows[i])) {
                throw new Error("Invalid input; targets are not in ascending order");
            }
            arrows[i].push(targetIdx);
        }
    }
    return {
        arrows,
        clues,
        outputCount: uniqueOutputs.size,
        answerHash: answer,
        generatedFromSeed: false,
        isDaily: false,
    };
}

export function validatePuzzleSolution(solution: string, answer: string): boolean {
    let solutionHash = hash(solution).toLowerCase();
    let answerHash = answer.toLowerCase();
    console.log(solution, solutionHash, answerHash);
    return solutionHash === answerHash;
}

export function serialise({
    arrows, clues, answerHash,
}: Pick<PuzzleData, "arrows" | "clues" | "answerHash">): string {
    let parts = [];
    for (let i in arrows) {
        let part = [clues[i], ...arrows[i].map(i => i.toString())];
        parts.push(part.join(","));
    }
    parts.push(answerHash);
    return parts.join(";");
}

export type PuzzleData = {
    arrows: ArrowSets;
    clues: string[];
    outputCount: number;
    answerHash: string;
} & ({
    generatedFromSeed: false;
    isDaily: false;
} | {
    generatedFromSeed: true;
    randomSeed: number;
    isDaily: boolean;
});
