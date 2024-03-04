import {Random} from "./random";

export type Source = number;
export type Destination = number;
export type ArrowSets = {[key: Source]: readonly Destination[];};
const SET_A: ArrowSets = {
    0: [0, 3, 6],
    1: [1, 3, 7],
    2: [2, 3, 4],
    3: [1, 5, 7],
    4: [0, 5, 6],
    5: [2, 4, 7],
};
const SET_B: ArrowSets = {
    0: [0, 4, 6],
    1: [1, 5, 7],
    2: [2, 5, 6],
    3: [0, 3, 7],
    4: [1, 3, 6],
    5: [2, 4, 5],
};

// animal,0,3,6;verb,1,3,7;transportation,2,3,4;food,1,5,7;furniture,0,5,6;verb,2,4,7;000d8041d1d221b1

export function generateArrowSets(random: Random): ArrowSets {
    // todo: implement an algorithm to generate arrow sets
    // rather than just picking one of the two predefined ones
    return random() > 0.5 ? SET_A : SET_B;
}