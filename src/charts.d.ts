declare module '@canvasjs/react-charts' {
    import { Component } from 'react';

    export interface CanvasJSChartProps {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        options: any;
    }

    export class CanvasJSChart extends Component<CanvasJSChartProps> {}
}
