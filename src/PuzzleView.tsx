import {Alert, Box, useMediaQuery, useTheme} from '@suid/material';
import LeaderLine from 'leader-line-new';
import {JSX, Show, createEffect, createMemo, createSignal} from 'solid-js';
import {ArrowSets} from './arrow_sets';
import {COLOURS} from './colours';
import {validatePuzzleSolution} from './puzzle_generator';
import {REVERSE_DICTIONARY} from './reverse_dictionary';

function shiftFocus(by = 1) {
    const inputs = [...document.querySelectorAll('input:not([disabled])')] as HTMLInputElement[];
    const thisInput = inputs.findIndex(
        (e) => e === document.activeElement
    );
    const next = inputs[(thisInput + by + inputs.length) % inputs.length];
    next?.focus();
}
function makeKeyEventHandler(i: number): JSX.EventHandler<HTMLInputElement, KeyboardEvent> {
    return (event) => {
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
    };
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
    arrows: ArrowSets;
    clues: string[];
    outputCount: number;
    answerHash: string;
    setError: (error: string) => void;
    saveSlot: string;
    isCustomPuzzle: boolean;
    onComplete: () => void;
}
export function PuzzleView(props: PuzzleViewProps) {
    let savedInputValues = JSON.parse(window.localStorage[props.saveSlot] || 'null');
    if (
        !Array.isArray(savedInputValues)
        || savedInputValues.length !== props.outputCount
        || savedInputValues.some((v: any) => !Array.isArray(v))
        || savedInputValues.some((v: any) => v.length !== props.clues.length)
        || savedInputValues.some((v: any) => v.some((v: any) => typeof v !== 'string'))
        || savedInputValues.some((v: any) => v.some((v: any) => v.length > 1))
    ) {
        savedInputValues = Array.from(
            {length: props.outputCount},
            _ => Array.from({length: props.clues.length}, _ => '')
        );
        if (window.localStorage[props.saveSlot]) {
            props.setError('Save data for this puzzle is corrupted, resetting');
        }
    }
    const [inputValues, setInputValues] = createSignal<string[][]>(
        savedInputValues,
        {equals: false}
    );
    createEffect(() => {
        window.localStorage[props.saveSlot] = JSON.stringify(inputValues());
    });
    const output = (i: number) => getUnique(inputValues()[i]);
    const makeInputInputEventHandler = (clue: number, letter: number): JSX.InputEventHandler<HTMLInputElement, InputEvent> => (event) => {
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
    const makeOutputInputEventHandler = (i: number): JSX.InputEventHandler<HTMLInputElement, InputEvent> => (event) => {
        let value = event.data ?? '';
        setInputValues(inputValues => {
            for (let j = 0; j < props.clues.length; j++) {
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
        for (let letter = 0; letter < props.outputCount; letter++) {
            let input: Element = <input
                value={output(letter)}
                onKeyDown={makeKeyEventHandler(letter)}
                onInput={makeOutputInputEventHandler(letter)}
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
    const inputs = createMemo((): Element[] => {
        let inputs = [];
        for (let clue = 0; clue < Object.keys(props.arrows).length; clue++) {
            let targets = props.arrows[clue];
            let element = <div>
                <Box sx={{
                    display: 'flex',
                    flexDirection: {xs: 'column', md: 'row-reverse'},
                    alignItems: 'center',
                }}>
                    <Clue
                        clue={props.clues[clue]}
                        letters={targets.map(letter => inputValues()[letter][clue] || output(letter))}
                        isCustomPuzzle={props.isCustomPuzzle}
                    />
                    <div class="row">
                        {targets.map(letter => <input
                            value={inputValues()[letter][clue]}
                            placeholder={output(letter)}
                            onKeyDown={makeKeyEventHandler(letter)}
                            onInput={makeInputInputEventHandler(clue, letter)}
                            style={{color: output(letter) == '!' ? 'red' : undefined}}
                            onFocus={e => e.target.setSelectionRange(0, e.target.value.length)}
                            onKeyUp={e => (
                                e.target as HTMLInputElement
                            ).setSelectionRange(
                                0,
                                (e.target as HTMLInputElement).value.length,
                            )}
                        />)}
                    </div>
                </Box>
            </div>;
            inputs.push(element as any);
        }
        return inputs;
    });
    const theme = useTheme();
    createEffect((oldLines: LeaderLine[]) => {
        // subscribe to the signals that draw banners
        let _ = won();
        const isLarge = useMediaQuery(theme.breakpoints.up('md'));
        const inputBoxes = inputs();
        const outputBoxes = outputs();
        let lines: LeaderLine[] = [];
        let colours = COLOURS[theme.palette.mode];
        for (let i = 0; i < Object.keys(props.arrows).length; i++) {
            let targets = props.arrows[i];
            for (let target of targets) {
                let source = inputBoxes[i];
                if (!isLarge()) {
                    source = source.querySelector('.row')!;
                }
                setTimeout(() => {
                    let line = oldLines.shift();
                    line?.hide();
                    line?.remove();
                    lines.push(new LeaderLine(
                        source, outputBoxes[target],
                        {
                            path: 'straight',
                            endPlug: 'arrow3',
                            color: colours[i % colours.length],
                            startSocket: 'right',
                            endSocket: 'left',
                        }
                    ));
                }, 1);
            }
        }
        return lines;
    }, []);
    const [won, setWon] = createSignal(window.localStorage[props.saveSlot + 'won'] === 'true');
    createEffect(() => {
        if (validatePuzzleSolution(
            Array.from({length: props.outputCount}, (_, i) => output(i)).join(''),
            props.answerHash,
        ) && !won()) {
            setWon(true);
            props.onComplete();
            window.localStorage[props.saveSlot + 'won'] = 'true';
        }
    });

    const shouldTransform = useMediaQuery(theme.breakpoints.up('md'));
    return <>
        <Show when={won()}>
            <Alert severity="success">You have completed this puzzle!</Alert>
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
            transform: shouldTransform() ? undefined : 'scale(0.75)',
        }}>
            <div class="column">
                {props.clues.map(clue => <div class="clue">
                    {clue}
                </div>)}
            </div>

            <div>
                {props.clues.map((_, clueIdx) => (
                    <div class="row" style={{gap: ''}}>
                        {Array.from({length: props.outputCount}, (_, letter) => (
                            props.arrows[clueIdx].includes(letter) ?
                                <input
                                    value={inputValues()[letter][clueIdx]}
                                    placeholder={output(letter)}
                                    onKeyDown={makeKeyEventHandler(letter)}
                                    onInput={makeInputInputEventHandler(clueIdx, letter)}
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

