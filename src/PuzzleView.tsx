import {Alert, Box, useMediaQuery, useTheme} from '@suid/material';
import LeaderLine from 'leader-line-new';
import {Show, createEffect, createMemo, createSignal, onCleanup, onMount} from 'solid-js';
import {COLOURS} from './colours';
import {PuzzleData, serialise, validatePuzzleSolution} from './puzzle_generator';
import {REVERSE_DICTIONARY} from './reverse_dictionary';

function shiftFocus(by = 1) {
    const inputs = [...document.querySelectorAll('input:not([disabled])')] as HTMLInputElement[];
    const thisInput = inputs.findIndex(
        (e) => e === document.activeElement
    );
    const next = inputs[(thisInput + by + inputs.length) % inputs.length];
    next?.focus();
}
function keyEventHandler(i: number, event: KeyboardEvent) {
    if (event.key === 'Unidentified') return; // doesn't work on mobile
    if (event.isComposing || event.keyCode === 229) return;
    if (event.key === 'Delete') {
        if ((event.target as HTMLInputElement).value.length === 0) {
            shiftFocus();
        }
        return;
    }
    if (event.key === 'Backspace') {
        if ((event.target as HTMLInputElement).value.length === 0) {
            shiftFocus(-1);
        }
        return;
    }
    if (event.key === 'Left' || event.key === 'ArrowLeft') {
        shiftFocus(-1);
        return;
    } else if (event.key === 'Right' || event.key === 'ArrowRight') {
        shiftFocus();
        return;
    }
}

function getUnique(vals: string[]): string {
    vals = vals.filter(v => v !== '');
    let unique = new Set(vals);
    if (unique.size > 1) {
        return '!';
    }
    return vals[0] ?? '';
}

interface ClueProps {
    clue: string;
    letters: string[];
    isCustomPuzzle: boolean;
}
function Clue(props: ClueProps) {
    let isValid = () => {
        if (!props.isCustomPuzzle && !props.letters.some(l => l === '')) {
            let word = props.letters.join('');
            return REVERSE_DICTIONARY[props.clue].includes(word);
        }
        return true;
    };
    return <div
        class="clue"
        style={{
            color: isValid() ? undefined : 'red',
        }}
        title={isValid() ? undefined : 'This word is not known to fit this clue'}
    >
        {props.clue}
    </div>;
}

interface PuzzleViewProps {
    data: PuzzleData;
    setError: (error: string) => void;
    isCustomPuzzle: boolean;
    onComplete: () => void;
    ref: (updateLines: () => void) => void;
}
export function PuzzleView(props: PuzzleViewProps) {
    let saveSlot = props.data.isDaily ? props.data.randomSeed.toString() : serialise(props.data);
    let savedInputValues = JSON.parse(window.localStorage[saveSlot] || 'null');
    if (
        !Array.isArray(savedInputValues)
        || savedInputValues.length !== props.data.outputCount
        || savedInputValues.some((v: any) => !Array.isArray(v))
        || savedInputValues.some((v: any) => v.length !== props.data.clues.length)
        || savedInputValues.some((v: any) => v.some((v: any) => typeof v !== 'string'))
        || savedInputValues.some((v: any) => v.some((v: any) => v.length > 1))
    ) {
        savedInputValues = Array.from(
            {length: props.data.outputCount},
            _ => Array.from({length: props.data.clues.length}, _ => '')
        );
        if (window.localStorage[saveSlot]) {
            props.setError('Save data for this puzzle is corrupted, resetting');
        }
    }
    const [inputValues, setInputValues] = createSignal<string[][]>(
        savedInputValues,
        {equals: false}
    );
    createEffect(() => {
        window.localStorage[saveSlot] = JSON.stringify(inputValues());
    });
    const output = (i: number) => getUnique(inputValues()[i]);
    const inputInputEventHandler = ([clue, letter]: [number, number], event: InputEvent) => {
        let value = event.data ?? '';
        if (!/^[a-zA-Z]$/.test(value)) {
            value = '';
        }
        setInputValues(inputValues => {
            inputValues[letter][clue] = value.toLowerCase();
            return inputValues;
        });
        if (value.length != 0) {
            shiftFocus();
        }
    };
    const outputInputEventHandler = (i: number, event: InputEvent) => {
        let value = event.data ?? '';
        setInputValues(inputValues => {
            for (let j = 0; j < props.data.clues.length; j++) {
                inputValues[i][j] = value.toLowerCase();
            }
            return inputValues;
        });
        if (value.length != 0) {
            shiftFocus();
        }
    };
    const outputs = createMemo((): Element[] => {
        let outputs = [];
        for (let letter = 0; letter < props.data.outputCount; letter++) {
            let input: Element = <input
                value={output(letter)}
                onKeyDown={[keyEventHandler, letter]}
                onInput={[outputInputEventHandler, letter]}
                style={{color: output(letter) == '!' ? 'red' : undefined}}
                onFocus={e => e.target.setSelectionRange(0, e.target.value.length)}
                onKeyUp={e => (
                    e.target as HTMLInputElement
                ).setSelectionRange(
                    0,
                    (e.target as HTMLInputElement).value.length,
                )}
            /> as any;
            outputs.push(input);
        }
        return outputs;
    });
    const inputs = createMemo(() => {
        let inputs = [];
        for (let clue = 0; clue < Object.keys(props.data.arrows).length; clue++) {
            let targets = props.data.arrows[clue];
            let element = <div>
                <Box sx={{
                    display: 'flex',
                    flexDirection: {xs: 'column', md: 'row-reverse'},
                    alignItems: 'center',
                }}>
                    <Clue
                        clue={props.data.clues[clue]}
                        letters={targets.map(letter => inputValues()[letter][clue] || output(letter))}
                        isCustomPuzzle={props.isCustomPuzzle} />
                    <div class="row">
                        {targets.map(letter => <input
                            value={inputValues()[letter][clue]}
                            placeholder={output(letter)}
                            onKeyDown={[keyEventHandler, letter]}
                            onInput={[inputInputEventHandler, [clue, letter]]}
                            style={{color: output(letter) == '!' ? 'red' : undefined}}
                            onFocus={e => e.target.setSelectionRange(0, e.target.value.length)}
                            onKeyUp={e => (
                                e.target as HTMLInputElement
                            ).setSelectionRange(
                                0,
                                (e.target as HTMLInputElement).value.length
                            )} />)}
                    </div>
                </Box>
            </div>;
            inputs.push(element as Element);
        }
        return inputs;
    });
    const theme = useTheme();
    let lines: [Element, number, LeaderLine][] = [];
    onMount(() => {
        const inputBoxes = inputs();
        const outputBoxes = outputs();
        let colours = COLOURS[theme.palette.mode];
        for (let i = 0; i < Object.keys(props.data.arrows).length; i++) {
            let targets = props.data.arrows[i];
            for (let target of targets) {
                let source = inputBoxes[i];
                lines.push([source, i, new LeaderLine(
                    source, outputBoxes[target],
                    {
                        path: 'straight',
                        endPlug: 'arrow3',
                        color: colours[i % colours.length],
                        startSocket: 'right',
                        endSocket: 'left',
                    }
                )]);
            }
        }
    });
    createEffect(() => {
        let isLarge = useMediaQuery(theme.breakpoints.up('md'))();
        // reposition the lines when the window is resized beyond the breakpoint
        for (let [source, _, line] of lines) {
            line.start = isLarge
                ? source
                // get the input box
                : source.querySelector('.row')!;
        }
    });
    createEffect(() => {
        const theme = useTheme();
        let colours = COLOURS[theme.palette.mode];
        setTimeout(() => {
            for (let [_, i, line] of lines) {
                line.color = colours[i % colours.length];
            }
        }, 0);
    });
    onCleanup(() => {
        while (lines.length > 0) {
            let [_, __, line] = lines.pop()!;
            line.hide();
            line.remove();
        }
    });
    props.ref(() => lines.forEach(([_, __, line]) => line.position()));
    const [won, setWon] = createSignal(window.localStorage[saveSlot + 'won'] === 'true');
    createEffect(() => {
        if (validatePuzzleSolution(
            Array.from({length: props.data.outputCount}, (_, i) => output(i)).join(''),
            props.data.answerHash,
        ) && !won()) {
            setWon(true);
            props.onComplete();
            window.localStorage[saveSlot + 'won'] = 'true';
        }
    });

    const shouldTransform = useMediaQuery(theme.breakpoints.up('md'));
    return <>
        <Show when={won()}>
            <Alert sx={{mb: 1}} severity="success">You have completed this puzzle!</Alert>
        </Show>
        <div class="puzzle">
            <div class="column">
                {inputs()}
            </div>
            <div class="spacer"></div>
            <div class="column">
                {outputs()}
            </div>
        </div>
        <div class="alt-puzzle-view" style={{
            transform: shouldTransform() ? undefined : 'scale(0.66)',
        }}>
            <div class="column">
                {props.data.clues.map(clue => <div class="clue">
                    {clue}
                </div>)}
            </div>

            <div>
                {props.data.clues.map((_, clueIdx) => (
                    <div class="row" style={{gap: ''}}>
                        {Array.from({length: props.data.outputCount}, (_, letter) => (
                            props.data.arrows[clueIdx].includes(letter) ?
                                <input
                                    value={inputValues()[letter][clueIdx]}
                                    placeholder={output(letter)}
                                    onKeyDown={[keyEventHandler, letter]}
                                    onInput={[inputInputEventHandler, [clueIdx, letter]]}
                                    style={{color: output(letter) == '!' ? 'red' : undefined}}
                                    onFocus={e => e.target.setSelectionRange(0, e.target.value.length)}
                                    onKeyUp={e => (
                                        e.target as HTMLInputElement
                                    ).setSelectionRange(
                                        0,
                                        (e.target as HTMLInputElement).value.length,
                                    )}
                                /> : <input
                                    disabled
                                    style={{
                                        "background-color": theme.palette.mode == 'dark'
                                            ? 'transparent'
                                            : 'black'
                                    }}
                                />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    </>;
}

