import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, Typography} from "@suid/material";
import {GitHub, Kofi} from "./extra_icons";

interface InfoDialogueProps {
    open: boolean;
    onClose: () => void;
}
export function InfoDialogue(props: InfoDialogueProps) {
    return <Dialog {...props}>
        <DialogTitle>About</DialogTitle>
        <DialogContent>
            <Typography>
                Tangleword is a word puzzle game, where several crossword-style clues
                each point to a vertical column. The answer to each clue is a three-letter
                word, made up of the three letters that the clue points to.
            </Typography>
            <br />
            <Typography>
                The game is won when all the letters on the right-hand side of the
                screen are filled in correctly, without causing any conflicts.
            </Typography>
            <br />
            <Typography>
                For convenience, an additional view is provided that shows the
                letters in a grid. This may be easier to read for some people.
            </Typography>
            <br />
            <Typography>
                This implementation of Tangleword, including the name 'Tangleword',
                was created by Starwort, based on the game described in <Link
                    href="https://www.theguardian.com/science/2024/mar/03/can-you-solve-it-the-word-game-at-the-cutting-edge-of-computer-science"
                >Alex Bellos' Guardian article</Link>.
            </Typography>
            <Box sx={{display: "flex", justifyContent: "center", gap: 2, paddingTop: 2}}>
                <Button href="https://ko-fi.com/starwort" startIcon={<Kofi />} variant="contained">
                    Support me on Ko-fi
                </Button>
                <Button href="https://github.com/Starwort/tangleword/" startIcon={<GitHub />} variant="contained">
                    View source on GitHub
                </Button>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onclick={props.onClose}>Close</Button>
        </DialogActions>
    </Dialog>;
}

