import { useEffect, useRef } from 'react';
import { ReactFlowState, useStore } from '@xyflow/react';

const storeSelector = (state: ReactFlowState) => ({
    width: state.width,
    height: state.height,
    transform: state.transform,
});

export type HelperLinesProps = {
    horizontal?: number;
    vertical?: number;
    lineWidth: number;
    lineColor: string;
};

// a simple component to display the helper lines
// it puts a canvas on top of the React Flow pane and draws the lines using the canvas API
const HelperLines: React.FC<HelperLinesProps> = ({ horizontal, vertical, lineWidth, lineColor }) => {
    const { width, height, transform } = useStore(storeSelector);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!ctx || !canvas) {
            return;
        }

        const dpi = window.devicePixelRatio;
        canvas.width = width * dpi;
        canvas.height = height * dpi;

        ctx.scale(dpi, dpi);
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;

        if (typeof vertical === 'number') {
            ctx.moveTo(vertical * transform[2] + transform[0], 0);
            ctx.lineTo(vertical * transform[2] + transform[0], height);
            ctx.stroke();
        }

        if (typeof horizontal === 'number') {
            ctx.moveTo(0, horizontal * transform[2] + transform[1]);
            ctx.lineTo(width, horizontal * transform[2] + transform[1]);
            ctx.stroke();
        }
    }, [width, height, transform, horizontal, vertical, lineWidth, lineColor]);

    return (
        <canvas
            ref={canvasRef}
            className='react-flow__canvas pointer-events-none absolute z-10 h-full w-full'
        />
    );
};

export default HelperLines;
