import { DataFrame, SourceNode, RFTransmitterObject, RelativeRSSIPosition, SensorSourceOptions } from '@openhps/core';
import * as WifiManager from 'react-native-wifi-reborn';

/**
 * WLAN source node using react-native-wifi-reborn.
 */
export class WLANSourceNode extends SourceNode<DataFrame> {
    protected options: SensorSourceOptions;
    private _timer: number;

    constructor(options?: SensorSourceOptions) {
        super(options);
        this.options.interval = this.options.interval || 100;

        this.once('build', this._onWifiInit.bind(this));
        this.once('destroy', this.stop.bind(this));
    }

    private _onWifiInit(): Promise<void> {
        return new Promise((resolve, reject) => {
            WifiManager.isEnabled().then(status => {
                if (!status) {
                    return reject(new Error(`WiFi not enabled!`));
                }
                if (this.options.autoStart) {
                    return this.start();
                } else {
                    return Promise.resolve();
                }
            }).then(resolve).catch(reject);
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
            }).catch((ex: Error) => {
                this.logger('error', ex);
            }).finally(() => {
                this._timer = setTimeout(this._scan.bind(this));
            });
    }

    public stop(): Promise<void> {
        return new Promise<void>((resolve) => {
            clearInterval(this._timer);
            this._timer = undefined;
            resolve();
        });
    }

    public parseList(wifiList: Array<WifiManager.WifiEntry>): DataFrame {
        const frame = new DataFrame();
        wifiList.forEach((value) => {
            const ap = new RFTransmitterObject(value.BSSID);
            ap.displayName = value.SSID;
            frame.addObject(ap);
            frame.source = this.source;
            frame.source.removeRelativePositions(ap.uid);
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
