import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import React from 'react';
import { Bold, Button, Box, Text, Row, Address, Icon, Image, Link} from '@metamask/snaps-sdk/jsx';

type InsightProps = {
  from: string;
  referenceInfo?: string;
  registrantUri?: string;
};

export const Insight: SnapComponent<InsightProps> = ({ from, referenceInfo, registrantUri }) => {
  return (
    <Box>
      <Box alignment='center' direction='horizontal' >
        {referenceInfo?
            [
            <Image src={checkmarkSvgContent} alt={(() => { console.log("loading checkmark icon"); return "Checkmark icon"; })()} />,
            <Text>{referenceInfo}</Text>
            ]
        :
        [
            <Image src={warningSvgContent} alt={(() => { console.log("loading warning icon"); return "Warning icon"; })()} />,
            <Text>This destination address does not belong to a referenced entity</Text>
        ]
        }
        </Box>
        {referenceInfo?
            [
            <Row label="Reference Info">
                <Text>{referenceInfo || "no reference"}</Text>
            </Row>,
            <Row label="registrantUri">
                {registrantUri ? <Link href={registrantUri}> {registrantUri} </Link> : <Text>No registrant URI</Text>}
            </Row>
            ]
        :<Text> <Bold>Accept only if you are confident</Bold> </Text>}
      <Button name="transaction-type">See transaction type</Button>
    </Box>
  );
};

// Inline warning SVG content
const warningSvgContent = `
<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 122.88 111.54"><defs><style>.cls-1{fill:#cf1f25;}.cls-2{fill:#fec901;fill-rule:evenodd;}.cls-3{fill:#010101;}</style></defs><title>warning</title><path class="cls-1" d="M2.35,84.42,45.28,10.2l.17-.27h0A23,23,0,0,1,52.5,2.69,17,17,0,0,1,61.57,0a16.7,16.7,0,0,1,9.11,2.69,22.79,22.79,0,0,1,7,7.26q.19.32.36.63l42.23,73.34.24.44h0a22.48,22.48,0,0,1,2.37,10.19,17.63,17.63,0,0,1-2.17,8.35,15.94,15.94,0,0,1-6.93,6.6c-.19.1-.39.18-.58.26a21.19,21.19,0,0,1-9.11,1.75v0H17.61c-.22,0-.44,0-.65,0a18.07,18.07,0,0,1-6.2-1.15A16.42,16.42,0,0,1,3,104.24a17.53,17.53,0,0,1-3-9.57,23,23,0,0,1,1.57-8.74,7.66,7.66,0,0,1,.77-1.51Z"/><path class="cls-2" d="M9,88.75,52.12,14.16c5.24-8.25,13.54-8.46,18.87,0l42.43,73.69c3.39,6.81,1.71,16-9.33,15.77H17.61C10.35,103.8,5.67,97.43,9,88.75Z"/><path class="cls-3" d="M57.57,83.78A5.53,5.53,0,0,1,61,82.2a5.6,5.6,0,0,1,2.4.36,5.7,5.7,0,0,1,2,1.3,5.56,5.56,0,0,1,1.54,5,6.23,6.23,0,0,1-.42,1.35,5.57,5.57,0,0,1-5.22,3.26,5.72,5.72,0,0,1-2.27-.53A5.51,5.51,0,0,1,56.28,90a5.18,5.18,0,0,1-.36-1.27,5.83,5.83,0,0,1-.06-1.31h0a6.53,6.53,0,0,1,.57-2,4.7,4.7,0,0,1,1.14-1.56Zm8.15-10.24c-.19,4.79-8.31,4.8-8.49,0-.82-8.21-2.92-29.34-2.86-37.05.07-2.38,2-3.79,4.56-4.33a12.83,12.83,0,0,1,5,0c2.61.56,4.65,2,4.65,4.44v.24L65.72,73.54Z"/></svg>
`;

const checkmarkSvgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 467.36"><g fill-rule="nonzero"><path fill="#333" d="M58.327 0h254.296c-11.984 13.787-22.844 27.299-32.641 40.444H58.327c-4.929 0-9.415 2.01-12.656 5.227a17.95 17.95 0 00-5.227 12.657v350.705c0 4.868 2.04 9.331 5.288 12.579 3.264 3.263 7.75 5.304 12.595 5.304h395.345c4.815 0 9.286-2.056 12.557-5.327 3.271-3.271 5.326-7.742 5.326-12.556V211.536A1199.255 1199.255 0 00512 194.294v214.739c0 15.995-6.611 30.592-17.173 41.154-10.562 10.562-25.159 17.173-41.155 17.173H58.327c-15.996 0-30.623-6.58-41.193-17.15C6.595 439.671 0 425.082 0 409.033V58.328C0 26.298 26.298 0 58.327 0z"/><path fill="#01A601" d="M137.419 167.477l62.691-.825a10.042 10.042 0 015.427 1.513c12.678 7.329 24.639 15.69 35.789 25.121a243.712 243.712 0 0122.484 21.681c21.972-34.811 48.576-70.325 76.509-103.639 34.552-41.2 71.358-79.245 104.09-108.6a10.045 10.045 0 016.718-2.567l48.071-.039c5.579 0 10.111 4.532 10.111 10.111 0 2.752-1.108 5.259-2.896 7.077-44.311 49.249-89.776 105.68-130.969 163.496-38.09 53.466-72.596 108.194-99.23 159.612-2.553 4.945-8.644 6.894-13.588 4.341a10.07 10.07 0 01-4.693-5.105c-14.582-31.196-32.052-59.924-52.916-85.679-20.887-25.778-45.244-48.645-73.567-68.087-4.593-3.134-5.777-9.423-2.644-14.016 2.002-2.935 5.296-4.479 8.613-4.395z"/></g></svg>
`;
