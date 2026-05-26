import * as react_jsx_runtime from 'react/jsx-runtime';

interface HydrometerPoint {
    at: string;
    gravitySg: number | null;
    temperatureC: number | null;
}
/**
 * Hydrometer chart data with timestamps + gravity/temp readings.
 */
interface HydrometerChartProps {
    points: HydrometerPoint[];
    title?: string;
    compact?: boolean;
    gravityLabel: string;
    temperatureLabel: string;
    xAxisLabel?: string;
    gravityAxisLabel?: string;
    temperatureAxisLabel?: string;
}
declare function HydrometerChart({ points, title, compact, gravityLabel, temperatureLabel, xAxisLabel, gravityAxisLabel, temperatureAxisLabel, }: HydrometerChartProps): react_jsx_runtime.JSX.Element | null;

export { HydrometerChart, type HydrometerChartProps };
