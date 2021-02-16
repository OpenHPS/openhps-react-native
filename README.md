<h1 align="center">
  <img alt="OpenHPS" src="https://openhps.org/images/logo_text-512.png" width="40%" /><br />
  @openhps/react-native
</h1>
<p align="center">
    <a href="https://ci.mvdw-software.com/job/openhps-react-native/" target="_blank">
        <img alt="Build Status" src="https://ci.mvdw-software.com/job/openhps-react-native/job/dev/badge/icon">
    </a>
    <a href="https://ci.mvdw-software.com/view/OpenHPS/job/openhps-react-native/job/dev/lastCompletedBuild/testReport" target="_blank">
        <img alt="Tests" src="https://img.shields.io/jenkins/tests?compact_message&jobUrl=https%3A%2F%2Fci.mvdw-software.com%2Fview%2FOpenHPS%2Fjob%2Fopenhps-react-native%2Fjob%2Fdev">
    </a>
    <a href="https://ci.mvdw-software.com/view/OpenHPS/job/openhps-react-native/job/dev/lastCompletedBuild/cobertura/" target="_blank">
        <img alt="Code coverage" src="https://img.shields.io/jenkins/coverage/cobertura?jobUrl=https%3A%2F%2Fci.mvdw-software.com%2Fview%2FOpenHPS%2Fjob%2Fopenhps-react-native%2Fjob%2Fdev%2F">
    </a>
    <a href="https://codeclimate.com/github/OpenHPS/openhps-react-native/" target="_blank">
        <img alt="Maintainability" src="https://img.shields.io/codeclimate/maintainability/OpenHPS/openhps-react-native">
    </a>
</p>

<h3 align="center">
    <a href="https://github.com/OpenHPS/openhps-core">@openhps/core</a> &mdash; <a href="https://openhps.org/docs/csv">API</a>
</h3>

<br />
This component offers react-native nodes.

## Getting Started
If you have [npm installed](https://www.npmjs.com/get-npm), start using @openhps/react-native with the following command.
```bash
npm install @openhps/react-native --save
```

### Features
- ```IMUSourceNode```: IMU source node that uses the internal sensors.
- ```BLESourceNode```: BLE source node that scans for (specific) BLE advertisements
- ```WLANSourceNode```: WLAN source node that scans for Wi-Fi access points.
- ```GeolocationSourceNode```: Processed geolocation data from native APIs.

## Contributors
The framework is open source and is mainly developed by PhD Student Maxim Van de Wynckel as part of his research towards *Hybrid Positioning and Implicit Human-Computer Interaction* under the supervision of Prof. Dr. Beat Signer.

## Contributing
Use of OpenHPS, contributions and feedback is highly appreciated. Please read our [contributing guidelines](CONTRIBUTING.md) for more information.

## License
Copyright (C) 2019-2021 Maxim Van de Wynckel & Vrije Universiteit Brussel

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.