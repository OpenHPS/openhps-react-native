export interface SensorData {
    x: number;
    y: number;
    z: number;
    timestamp: number;
}

export interface BarometerData {
    pressure: number;
    timestamp: number;
}

export interface OrientationData {
    qx: number;
    qy: number;
    qz: number;
    qw: number;
    pitch: number;
    roll: number;
    yaw: number;
    timestamp: number;
}
