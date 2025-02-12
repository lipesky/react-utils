import { Box } from "@mui/material";
import { CSSProperties, PropsWithChildren } from "react"

export interface NormalizedWidthContainerProps {
    maxWidth? : number;
    style?: CSSProperties;
}

export const NormalizedWidthContainer = ({children, maxWidth = 1766, style}: NormalizedWidthContainerProps & PropsWithChildren) => {
    return(
        <Box display="flex" justifyContent="center" alignItems="center" style={style}>
            <Box sx={{
                width: '100%',
                maxWidth: `${maxWidth}px`,
                padding: '0px 40px'
            }}>
                {children}
            </Box>
        </Box>
    );
}