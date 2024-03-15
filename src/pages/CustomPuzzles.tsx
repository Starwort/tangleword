import {Card, CardHeader, Divider, List, ListItem, ListItemButton, ListItemText, ListSubheader} from "@suid/material";
import {PageProps} from "./PageProps";

const CUSTOM_PUZZLES: Record<string, [string, string][]> = {
    "Tangleword Original": [
        ["Puzzle 1", "exclamation,0,1,7;hardware,0,3,4;verb,0,4,5;poetic+or+archaic+verb,1,3,6;Egyptian+mother+goddess,2,4,5;French+sea,2,6,7;0017273f203112bf"],
    ],
    "The Guardian": [
        ["Example", "animal,0,3,6;verb,1,3,7;transportation,2,3,4;food,1,5,7;furniture,0,5,6;verb,2,4,7;000d8041d1d221b1"],
        ["Puzzle 1", "Great Dane,0,4,6;sponge,1,5,7;hook,2,5,6;appreciate,0,3,7;capacious,1,3,6;Edgar A,2,4,5;00188e1478c3610c"],
        ["Puzzle 2", "murder,0,4,6;exclamation,1,5,7;furnishing,2,5,6;pronoun,0,3,7;computer term,1,3,6;female name,2,4,5;001af2df7e03c484"],
        ["Puzzle 3", "time,0,4,6;captive,1,5,7;male name,2,5,6;noise,0,3,7;object,1,3,6;city,2,4,5;0009297419c64ad9"],
    ],
    "User-Submitted": [
        ["cheddarmonk's Puzzle", "residue,0,2,6;consumed,0,5,7;receptacle,1,3,4;0 or 1,1,3,5;the cat's mother,2,6,7;generic ordinal,4,5,6;0008741ae4183550"],
    ],
};

export function CustomPuzzles(props: PageProps) {
    return <>
        <Card sx={{
            maxWidth: 600,
            width: "100%",
            textAlign: "center"
        }}>
            <CardHeader
                title="Custom Puzzles"
                subheader="Puzzles made by humans"
            />
            <List>
                {Object.entries(CUSTOM_PUZZLES).map(([category, puzzles]) => (
                    <>
                        <ListSubheader sx={{backgroundColor: "transparent"}}>
                            {category}
                        </ListSubheader>
                        {puzzles.map(([name, puzzleDesc]) => <ListItem disablePadding>
                            <ListItemButton
                                component="a"
                                href={window.location.pathname + "?puzzle=" + puzzleDesc}
                                onClick={event => {
                                    event.preventDefault();
                                    props.setPage("play", "puzzle=" + puzzleDesc);
                                }}
                            >
                                <ListItemText primary={name} />
                            </ListItemButton>
                        </ListItem>)}
                    </>
                ))}
                <Divider />
                <ListItemButton
                    component="a"
                    href={window.location.pathname + "?page=designer"}
                    onClick={event => {
                        event.preventDefault();
                        props.setPage("designer");
                    }}
                >
                    <ListItemText primary="Design your own" />
                </ListItemButton>
            </List>
        </Card>
    </>;
}