import { DataFrame, SourceNode, RFTransmitterObject, RelativeRSSIPosition, SensorSourceOptions } from '@openhps/core';
import { WifiEntry, loadWifiList, reScanAndLoadWifiList } from 'react-native-wifi-reborn';

/**
 * WLAN source node using react-native-wifi-reborn.
 */
export class WLANSourceNode extends SourceNode<DataFrame> {
    protected options: SensorSourceOptions;
    private _timer: number;

    constructor(options?: SensorSourceOptions) {
        super(options);
        this.options.interval = this.options.interval || 100;
        if (this.options.autoStart) {
            this.once('build', this.start.bind(this));
        }
        this.once('destroy', this.stop.bind(this));
    }

    public start(): Promise<void> {
        return new Promise<void>((resolve) => {
            // Scan interval
            this._timer = setInterval(() => {
                // Load wifi list
                reScanAndLoadWifiList()
                    .then((wifiList: Array<WifiEntry>) => {
                        this.push(this.parseList(wifiList));
                    })
                    .catch((ex: Error) => {
                        this.logger('error', ex.message);
                    });
            }, this.options.interval);
            resolve();
        });
    }

    public stop(): Promise<void> {
        return new Promise<void>((resolve) => {
            clearInterval(this._timer);
            resolve();
        });
    }

    public parseList(wifiList: Array<WifiEntry>): DataFrame {
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
            loadWifiList()
                .then((wifiList: Array<WifiEntry>) => {
                    resolve(this.parseList(wifiList));
                })
                .catch(reject);
        });
    }
}
