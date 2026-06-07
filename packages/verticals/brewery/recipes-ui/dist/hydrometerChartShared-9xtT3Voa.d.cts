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

export type { HydrometerChartProps as H };
