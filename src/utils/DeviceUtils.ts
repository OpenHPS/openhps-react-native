import DeviceInfo from 'react-native-device-info';

/**
 * Get the device unique identifier
 *
 * @returns {string} Unique identifier
 */
export function getDeviceUniqueId(): string {
    return DeviceInfo.getUniqueId();
}
