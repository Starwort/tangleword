import {JSX, Show, createEffect, createSignal, type Component} from 'solid-js';

import {Share} from '@suid/icons-material';
import {Alert, AppBar, CssBaseline, IconButton, ThemeProvider, Toolbar, Typography, createTheme} from '@suid/material';
import LeaderLine from 'leader-line-new';
import {tabbable} from 'tabbable';
import AboutButton from './AboutButton';
import './App.scss';
import {ArrowSets, generateArrowSets} from './arrow_sets';
import {COLOURS} from './colours';
import {generatePuzzle, puzzleFromString, serialise, validatePuzzleSolution} from './puzzle_generator';
import {makeRandom} from './random';

const App: Component = () => {
    const query = new URLSearchParams(window.location.search);
    const [error, setError] = createSignal('');
    let arrows: ArrowSets, clues: string[], outputCount, answerHash: string;
    if (query.has('puzzle')) {
        try {
            [arrows, clues, outputCount, answerHash] = puzzleFromString(
                query.get('puzzle')!
            );
        } catch (_error) {
            let error: Error = _error as any;
            setError(error.message);
            const random = makeRandom(0);
            arrows = generateArrowSets(random);
            [clues, outputCount, answerHash] = generatePuzzle(arrows, random);
        }
    } else {
        const random = makeRandom(0);
        arrows = generateArrowSets(random);
        [clues, outputCount, answerHash] = generatePuzzle(arrows, random);
    }
    const [outputValues, setOutputValues] = createSignal<string[]>(
        Array.from({length: outputCount}).map(_ => ''), {equals: false}
    );
    const outputs: Element[] = [];
    const shiftFocus = (by = 1) => {
        const inputs = tabbable(document.documentElement);
        const thisInput = inputs.findIndex(
            (e) => e === document.activeElement,
        );
        const next = inputs[thisInput + by];
        next?.focus();
    };
    const makeKeyEventHandler = (i: number): JSX.EventHandler<HTMLInputElement, KeyboardEvent> => (event) => {
        if (event.key === 'Unidentified') return; // doesn't work on mobile
        if (event.isComposing || event.keyCode === 229) return;
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
    const makeInputEventHandler = (i: number): JSX.InputEventHandler<HTMLInputElement, InputEvent> => (event) => {
        let value = event.target.value;
        if (value.length > 1) {
            value = value[value.length - 1];
        }
        setOutputValues(outputValues => {
            outputValues[i] = value;
            return outputValues;
        });
        if (event.target.value.length != 0) {
            shiftFocus();
        }
    };
    for (let i = 0; i < outputCount; i++) {
        let input: Element = <input
            value={outputValues()[i]}
            onKeyDown={makeKeyEventHandler(i)}
            onInput={makeInputEventHandler(i)}
        /> as any;
        outputs.push(input);
    }
    const inputs: Element[] = [];
    for (let i = 0; i < Object.keys(arrows).length; i++) {
        let targets = arrows[i];
        let element = <div class="row">
            {targets.map(i => <input
                value={outputValues()[i]}
                onKeyDown={makeKeyEventHandler(i)}
                onInput={makeInputEventHandler(i)}
            />)}
            <div class="clue">
                {clues[i]}
            </div>
        </div>;
        inputs.push(element as any);
    }
    createEffect((oldLines: LeaderLine[]) => {
        for (let line of oldLines) {
            line.hide();
            line.remove();
        }
        // subscribe to the signals that draw banners
        let _: any = won();
        _ = error();
        const lines = [];
        for (let i = 0; i < Object.keys(arrows).length; i++) {
            let targets = arrows[i];
            for (let target of targets) {
                lines.push(new LeaderLine(
                    inputs[i], outputs[target],
                    {path: 'straight', endPlug: 'arrow3', color: COLOURS[i % COLOURS.length]}
                ));
            }
        }
        return lines;
    }, []);
    const [won, setWon] = createSignal(false);
    createEffect(() => {
        if (validatePuzzleSolution(outputValues().join(''), answerHash)) {
            setWon(true);
        }
    });

    return <ThemeProvider theme={createTheme({palette: {mode: 'dark'}})}>
        <CssBaseline />
        <AppBar>
            <Toolbar>
                <Typography variant='h5' component='h1' sx={{
                    flexGrow: 1,
                }}>
                    PCP Word Puzzle
                </Typography>
                <AboutButton />
                <IconButton
                    color='inherit'
                    onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.set('puzzle', serialise(
                            arrows, clues, answerHash
                        ));
                        navigator.clipboard.writeText(decodeURIComponent(url.href));
                    }}
                    title="Share this puzzle"
                >
                    <Share />
                </IconButton>
            </Toolbar>
        </AppBar>
        <Toolbar />
        <main>
            <Show when={error()}>
                <Alert severity="error">{error()}</Alert>
            </Show>
            <Show when={won()}>
                <Alert severity="success">You won!</Alert>
            </Show>
            <div class="puzzle">
                <div class="column">
                    {inputs}
                </div>
                <div class="spacer"></div>
                <div class="column">
                    {outputs}
                </div>
            </div>
        </main>
    </ThemeProvider>;
};

export default App;
