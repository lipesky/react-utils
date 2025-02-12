import { Typography } from "@mui/material";
import { CSSProperties, PropsWithChildren, useEffect, useRef, useState } from "react";

export interface ExpandableTextProps {
    maxLines?: number;
    variant?: string;
    component?: string;
    style?: CSSProperties;
}

export const ExpandableText = ({
    children,
    maxLines = 3,
    variant = 'sectionTitle',
    component = 'p',
    style

}: ExpandableTextProps & PropsWithChildren) => {

    const animationDurationMs = 400;

    const [expanded, setExpanded] = useState<boolean>(false);
    const [lineClamp, setLineClamp] = useState<string>('unset');
    const textRef = useRef<HTMLElement | null>(null);
    const [lineHeight, setLineHeight] = useState<number | undefined>();

    const handleExpand = () => {
        setExpanded(!expanded);
    }

    useEffect(
        () =>{
            if(!expanded){
                setTimeout(() => {
                    setLineClamp(maxLines.toString());
                }, animationDurationMs);
            }else{
                setLineClamp('unset');
            }
        },
        [expanded]
    );

    useEffect(
        () =>{
            if(textRef.current){
                setLineHeight(
                    parseInt(getComputedStyle(textRef.current).lineHeight.slice(0,-2)),
                );
            }
        },
        []
    );

    let maxHeight = '120px';
    if(lineHeight && !expanded){
        maxHeight = `${lineHeight * maxLines}px`;
    }else if(lineHeight && textRef.current ){
        maxHeight = `${textRef.current.scrollHeight}px`;
    }
    
    return (
        <Typography
            ref={textRef}
            variant={variant as any}
            component={component as any}
            onClick={handleExpand}
            style={{
                maxHeight: maxHeight,
                overflow: "hidden",
                display: '-webkit-box',
                WebkitLineClamp: lineClamp,
                WebkitBoxOrient: "vertical",
                transition: `max-height ${animationDurationMs}ms ease-in-out`,
                ...(style?? {})
            }}
        >
            {children}
        </Typography>
    );
}