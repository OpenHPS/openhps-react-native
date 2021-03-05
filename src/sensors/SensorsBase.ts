import { Observable } from 'rxjs';
import { BarometerData, OrientationData, SensorData } from './SensorData';

export type SensorsBase = {
    accelerometer: Observable<SensorData>;
    gyroscope: Observable<SensorData>;
    magnetometer: Observable<SensorData>;
    barometer: Observable<BarometerData>;
    orientation: Observable<OrientationData>;
};

export type SensorType = 'linearaccelerometer' | 'accelerometer' | 'magnetometer' | 'orientation' | 'gyroscope';
