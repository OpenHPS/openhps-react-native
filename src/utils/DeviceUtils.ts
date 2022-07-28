import DeviceInfo from 'react-native-device-info';

/**
 * Get the device unique identifier
 *
 * @returns {string} Unique identifier
 */
export function getDeviceUniqueId(): Promise<string> {
    return DeviceInfo.getUniqueId();
}
