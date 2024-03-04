import {IconButton} from "@suid/material";
import {JSX} from "solid-js/jsx-runtime";

export default function AboutButton(props: {href: string, children?: JSX.Element;}) {
    // @ts-ignore - this works but the types seem to be wrong
    return <IconButton
        color='inherit'
        target='_blank'
        {...props}
    />;
}