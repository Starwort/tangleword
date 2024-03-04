import {InfoOutlined} from "@suid/icons-material";
import {IconButton} from "@suid/material";

export default function AboutButton() {
    // @ts-ignore - this works but the types seem to be wrong
    return <IconButton
        color='inherit'
        href='https://www.theguardian.com/science/2024/mar/03/can-you-solve-it-the-word-game-at-the-cutting-edge-of-computer-science'
        target='_blank'
    >
        <InfoOutlined />
    </IconButton>;
}