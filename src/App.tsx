import {Show, createSignal} from 'solid-js';

import {InfoOutlined, Share} from '@suid/icons-material';
import {Alert, AppBar, CssBaseline, IconButton, SvgIcon, ThemeProvider, Toolbar, Typography, createTheme} from '@suid/material';
import {SvgIconProps} from '@suid/material/SvgIcon';
import './App.scss';
import LinkButton from './LinkButton';
import {PuzzleView} from './PuzzleView';
import {ArrowSets, generateArrowSets} from './arrow_sets';
import {generatePuzzle, puzzleFromString, serialise} from './puzzle_generator';
import {makeRandom} from './random';

export default function App() {
    const query = new URLSearchParams(window.location.search);
    const [error, setError] = createSignal('');
    let arrows: ArrowSets, clues: string[], outputCount, answerHash: string;
    let randomSeed: number;
    if (query.has('seed')) {
        randomSeed = parseInt(query.get('seed')!);
        if (isNaN(randomSeed)) {
            setError('Invalid seed');
            randomSeed = Math.floor(new Date() as any / 8.64e7);
        }
    } else {
        randomSeed = Math.floor(new Date() as any / 8.64e7);
    }
    const random = makeRandom(randomSeed);
    let generatedFromSeed = true;
    if (query.has('puzzle')) {
        try {
            [arrows, clues, outputCount, answerHash] = puzzleFromString(
                query.get('puzzle')!
            );
            generatedFromSeed = false;
        } catch (_error) {
            let error: Error = _error as any;
            setError(error.message);
            arrows = generateArrowSets(random);
            [clues, outputCount, answerHash] = generatePuzzle(arrows, random);
        }
    } else {
        arrows = generateArrowSets(random);
        [clues, outputCount, answerHash] = generatePuzzle(arrows, random);
    }
    const theme = createTheme({palette: {mode: 'dark'}});
    return <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar>
            <Toolbar sx={{gap: 1}}>
                <Typography variant='h5' component='h1' sx={{
                    flexGrow: 1,
                }}>
                    Tangleword
                </Typography>
                <LinkButton href="https://www.theguardian.com/science/2024/mar/03/can-you-solve-it-the-word-game-at-the-cutting-edge-of-computer-science">
                    <InfoOutlined />
                </LinkButton>
                <IconButton
                    color='inherit'
                    onClick={() => {
                        const urlObj = new URL(window.location.href);
                        urlObj.search = '';
                        if (generatedFromSeed) {
                            urlObj.searchParams.set('seed', randomSeed.toString());
                        } else {
                            urlObj.searchParams.set('puzzle', serialise(
                                arrows, clues, answerHash
                            ));
                        }
                        let url = decodeURIComponent(urlObj.href);
                        if (
                            'share' in navigator
                            && (!('canShare' in navigator) || navigator.canShare({url}))
                        ) {
                            navigator.share({url});
                        } else {
                            navigator.clipboard.writeText(url);
                        }
                    }}
                    title="Share this puzzle"
                >
                    <Share />
                </IconButton>
                <LinkButton href="https://github.com/Starwort/tangleword">
                    <GitHub />
                </LinkButton>
            </Toolbar>
        </AppBar>
        <Toolbar />
        <main>
            <Show when={error()}>
                <Alert severity="error">{error()}</Alert>
            </Show>
            <PuzzleView
                arrows={arrows}
                clues={clues}
                outputCount={outputCount}
                answerHash={answerHash}
                error={error()}
            />
        </main>
    </ThemeProvider>;
}

function GitHub(props: SvgIconProps) {
    return <SvgIcon {...props}>
        <path d="M12 1.27a11 11 0 00-3.48 21.46c.55.09.73-.28.73-.55v-1.84c-3.03.64-3.67-1.46-3.67-1.46-.55-1.29-1.28-1.65-1.28-1.65-.92-.65.1-.65.1-.65 1.1 0 1.73 1.1 1.73 1.1.92 1.65 2.57 1.2 3.21.92a2 2 0 01.64-1.47c-2.47-.27-5.04-1.19-5.04-5.5 0-1.1.46-2.1 1.2-2.84a3.76 3.76 0 010-2.93s.91-.28 3.11 1.1c1.8-.49 3.7-.49 5.5 0 2.1-1.38 3.02-1.1 3.02-1.1a3.76 3.76 0 010 2.93c.83.74 1.2 1.74 1.2 2.94 0 4.21-2.57 5.13-5.04 5.4.45.37.82.92.82 2.02v3.03c0 .27.1.64.73.55A11 11 0 0012 1.27" />,
    </SvgIcon>;
}
