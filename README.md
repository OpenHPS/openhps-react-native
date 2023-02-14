<h1 align="center">
  <img alt="OpenHPS" src="https://openhps.org/images/logo_text-512.png" width="40%" /><br />
  @openhps/react-native
</h1>
<p align="center">
    <a href="https://github.com/OpenHPS/openhps-react-native/actions/workflows/main.yml" target="_blank">
        <img alt="Build Status" src="https://github.com/OpenHPS/openhps-react-native/actions/workflows/main.yml/badge.svg">
    </a>
    <a href="https://codeclimate.com/github/OpenHPS/openhps-react-native/" target="_blank">
        <img alt="Maintainability" src="https://img.shields.io/codeclimate/maintainability/OpenHPS/openhps-react-native">
    </a>
    <a href="https://badge.fury.io/js/@openhps%2Freact-native">
        <img src="https://badge.fury.io/js/@openhps%2Freact-native.svg" alt="npm version" height="18">
    </a>
</p>

<h3 align="center">
    <a href="https://github.com/OpenHPS/openhps-core">@openhps/core</a> &mdash; <a href="https://openhps.org/docs/react-native">API</a>
</h3>

<br />
This component offers react-native nodes. Each node uses peer dependencies for

## Features
- ```IMUSourceNode```: IMU source node that uses the internal sensors.
- ```BLESourceNode```: BLE source node that scans for (specific) BLE advertisements.
- ```WLANSourceNode```: WLAN source node that scans for Wi-Fi access points (Android only).
- ```GeolocationSourceNode```: Processed geolocation data from native APIs.

## Peer Dependencies
@openhps/react-native uses peer dependencies to create OpenHPS compatible data frames. When using a certain source node, you will have to install one or more of these dependencies manually.
- [react-native-sensors](https://www.npmjs.com/package/react-native-sensors)
- [react-native-wifi-reborn](https://www.npmjs.com/package/react-native-wifi-reborn)
- [react-native-ble-plx](https://www.npmjs.com/package/react-native-ble-plx)
- [react-native-geolocation-service](https://www.npmjs.com/package/react-native-geolocation-service)
- @openhps/imu
- @openhps/rf

## Getting Started
If you have [npm installed](https://www.npmjs.com/get-npm), start using @openhps/react-native with the following command.
```bash
npm install @openhps/react-native --save
```
### Usage

#### BLESourceNode
The BLE source node scans for Bluetooth low energy devices using react-native-ble-plx as a peer dependency.

#### IMUSourceNode
The IMU source node uses react-native-sensors as a peer depedency to gather magnetometer, gyroscope, accelerometer and orientation data in an IMUDataFrame.

#### WLANSourceNode
With the WLAN source node that uses react-native-wifi-reborn as a peer dependency, you can get a complete scan list of Wi-Fi access points. 

#### GeolocationSourceNode
High level geolocation source node using react-native-geolocation-service.

## Contributors
The framework is open source and is mainly developed by PhD Student Maxim Van de Wynckel as part of his research towards *Hybrid Positioning and Implicit Human-Computer Interaction* under the supervision of Prof. Dr. Beat Signer.

## Contributing
Use of OpenHPS, contributions and feedback is highly appreciated. Please read our [contributing guidelines](CONTRIBUTING.md) for more information.

## License
Copyright (C) 2019-2023 Maxim Van de Wynckel & Vrije Universiteit Brussel

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.