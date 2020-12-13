# Timer Card by [@sopelj](https://www.github.com/sopelj)

[![GitHub Release](https://img.shields.io/github/release/sopelj/lovelace-timer-card.svg?style=for-the-badge)](https://github.com/sopelj/lovelace-timer-card/releases)
[![License](https://img.shields.io/github/license/sopelj/lovelace-timer-card.svg?style=for-the-badge)](LICENSE.md)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)
![Project Maintenance](https://img.shields.io/maintenance/yes/2020.svg?style=for-the-badge)

A widget to display timers in a larger more visible way than the standard entity card whilst still displaying a realtime coutdown.

_Please ⭐️ this repo if you find it useful_

![Example](./example.png)

## Options

| Name   | Type   | Requirement  | Description                      | Default     |
| ------ | ------ | ------------ | -------------------------------- | ----------- |
| type   | string | **Required** | `custom:timer-card`              |             |
| entity | string | **Required** | Your timer entity                |             |
| name   | string | **Optional** | Header `false` to disable        | Entity name |

## Installation with Hacs

```yaml
- url: /hacsfiles/lovelace-timer-card/timer-card.js
  type: module
```

## Development

Clone the repo and run `yarn install` or `npm install`.

You can then run `yarn run start` to run `rollup` watch. You can then add the developement card by adding the following to your lovelace config. (Replacing IP*ADDRESS with the IP of the computer on which you're running the command) \_You may need to temporarily allow loading of mixed resources if you are testing on a site with HTTPS*

```yaml
- url: http://IP_ADDRESS:5000/timer-card.js
  type: module
```

You can then use `yarn run lint` and then `yarn run build`

## Credits

This was created using the [Boilerplate Card](https://github.com/custom-cards/boilerplate-card) by [@iantrich](https://www.github.com/iantrich)

Parts of this are based of the [timer card](https://github.com/custom-cards/timer-card) that doesn't seem to be maintained anymore
