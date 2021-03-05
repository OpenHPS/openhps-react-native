import { DataFrame, SourceNode, RelativeRSSIPosition, SensorSourceOptions, WLANObject } from '@openhps/core';
import WifiManager from 'react-native-wifi-reborn';

/**
 * WLAN source node using react-native-wifi-reborn.
 */
export class WLANSourceNode extends SourceNode<DataFrame> {
    protected options: SensorSourceOptions;
    private _timer: number;

    constructor(options?: SensorSourceOptions) {
        super(options);
        this.options.interval = this.options.interval || 0;

        this.once('build', this._onWifiInit.bind(this));
        this.once('destroy', this.stop.bind(this));
    }

    private _onWifiInit(): Promise<void> {
        return new Promise((resolve, reject) => {
            WifiManager.isEnabled()
                .then((status) => {
                    if (!status) {
                        return reject(new Error(`WiFi not enabled!`));
                    }
                    if (this.options.autoStart) {
                        return this.start();
                    } else {
                        return Promise.resolve();
                    }
                })
                .then(resolve)
                .catch(reject);
        });
    }

    public start(): Promise<void> {
        return new Promise<void>((resolve) => {
            // Scan interval
            this._timer = setTimeout(this._scan.bind(this), this.options.interval);
            resolve();
        });
    }

    private _scan(): void {
        if (!this._timer) {
            return;
        }

        // Load wifi list
        WifiManager.reScanAndLoadWifiList()
            .then((wifiList: Array<WifiManager.WifiEntry>) => {
                this.push(this.parseList(wifiList));
            })
            .catch((ex: Error) => {
                this.logger('error', ex);
            })
            .finally(() => {
                if (!this._timer) {
                    return;
                }
                this._timer = setTimeout(this._scan.bind(this), this.options.interval);
            });
    }

    public stop(): Promise<void> {
        return new Promise<void>((resolve) => {
            clearTimeout(this._timer);
            this._timer = undefined;
            resolve();
        });
    }

    public parseList(wifiList: Array<WifiManager.WifiEntry>): DataFrame {
        const frame = new DataFrame();
        frame.source = this.source;
        frame.source.relativePositions.forEach((pos) => frame.source.removeRelativePositions(pos.referenceObjectUID));
        wifiList.forEach((value) => {
            const ap = new WLANObject(value.BSSID);
            ap.displayName = value.SSID;
            ap.channel = value.frequency;
            ap.capabilities = value.capabilities;
            frame.addObject(ap);
            frame.source.addRelativePosition(new RelativeRSSIPosition(ap, value.level));
        });
        return frame;
    }

    public onPull(): Promise<DataFrame> {
        return new Promise<DataFrame>((resolve, reject) => {
            WifiManager.loadWifiList()
                .then((wifiList: Array<WifiManager.WifiEntry>) => {
                    resolve(this.parseList(wifiList));
                })
                .catch(reject);
        });
    }
}
