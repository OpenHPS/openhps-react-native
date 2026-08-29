import 'mocha';

/**
 * Every node in this package imports a React Native native module
 * (react-native-ble-plx, react-native-wifi-reborn, react-native-geolocation-service).
 * Those ship untranspiled Flow/ESM source meant for the Metro bundler, so `../../src`
 * cannot be loaded by mocha under plain Node at all -- the failure happens at import
 * time, before any assertion could run.
 *
 * Until this package gets a React Native test runtime, the suite exists so that
 * `npm test` reports honestly rather than exiting non-zero on "No test files found",
 * which is what it did before. See the fleet convention of pending an assertion whose
 * environment is unavailable rather than deleting or faking it.
 */
describe('@openhps/react-native', () => {
    it('should export the source nodes');
});
