'use client';
import React, { useState, useEffect } from 'react';

import dynamic from 'next/dynamic';

const CanvasJSChart = dynamic(
    async () => {
        const mod = await import('@canvasjs/react-charts');
        return mod.default?.CanvasJSChart || mod.CanvasJSChart;
    },
    { ssr: false }
);

import { NodeProps } from '@xyflow/react';

import NodeShell from '../NodeShell';

import { usePlatform, ConnectionState } from '@/app/platform';

const Graph: React.FC<NodeProps> = (props) => {
    const [disabled, setIsDisabled] = useState(false);
    const [dataPoints, setDataPoints] = useState<{ x: number; y: number }[]>([]);
    const platform = usePlatform();

    const MAX_POINTS = 3000; // Max points to keep in the rolling buffer
    const BATCH_SIZE = 500; // Number of points added per interval
    const INTERVAL_MS = 30; // Interval to update points
    const SINE_FREQUENCY = 0.05; // Lower frequency of sine wave
    const NOISE_RANGE = 0.2; // Max random noise added to y-values

    useEffect(() => {
        setIsDisabled(platform.connectionState !== ConnectionState.Connected);
    }, [platform.connectionState]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDataPoints((prev) => {
                const lastX = prev.length > 0 ? prev[prev.length - 1].x : 0;
                const newPoints = Array.from({ length: BATCH_SIZE }, (_, i) => {
                    const x = lastX + i + 1;
                    const noise = Math.random() * NOISE_RANGE - NOISE_RANGE / 2; // Random noise between ±NOISE_RANGE/2
                    return {
                        x,
                        y: Math.sin(x * SINE_FREQUENCY) + noise,
                    };
                });

                const updatedPoints = [...prev, ...newPoints];
                return updatedPoints.length > MAX_POINTS ? updatedPoints.slice(BATCH_SIZE) : updatedPoints;
            });
        }, INTERVAL_MS);

        return () => clearInterval(interval);
    }, []);

    if (!CanvasJSChart) return null;

    const options = {
        animationEnabled: true,
        exportEnabled: true,
        theme: 'dark2',
        backgroundColor: '#1f2937',
        gridThickness: 0,
        zoomEnabled: false,
        axisY: {
            title: 'Voltage',
            suffix: 'V',
            gridDashType: 'dot',
        },
        axisX: {
            title: 'Time',
            valueFormatString: ' ',
            tickLength: 0,
        },
        data: [
            {
                type: 'line',
                dataPoints: dataPoints,
            },
        ],
    };

    return (
        <NodeShell
            topLeft={'Graph'}
            topRight={'TBD'}
            bottomRight={'TBD'}
            selected={props.selected || false}
            disabled={disabled}
        >
            <div className='nodrag nopan w-[1200px]'>
                <CanvasJSChart options={options} />
            </div>
        </NodeShell>
    );
};

export default Graph;
