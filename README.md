# Timer Card by [@sopelj](https://www.github.com/sopelj)

[![GitHub Release](https://img.shields.io/github/release/sopelj/lovelace-timer-card.svg?style=for-the-badge)](https://github.com/sopelj/lovelace-timer-card/releases)
[![License](https://img.shields.io/github/license/sopelj/lovelace-timer-card.svg?style=for-the-badge)](LICENSE.md)
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)
![Project Maintenance](https://img.shields.io/maintenance/yes/2021.svg?style=for-the-badge)

A widget to display timers in a larger more visible manner than the standard entity card whilst still displaying a realtime countdown. None of the other options I tried would refresh the display quick enough.

This card can also display Timer(s) from the [Google Home integration](https://github.com/leikoilja/ha-google-home).

It should also theoretically work with Alexa Timers from the [Alexa Media Player Inetgration](https://github.com/custom-components/alexa_media_player), but I don't have Alexa and have been unable to test thus far.

![Example](./example.png)

## Options

| Name           | Type    | Requirement  | Description                                | Default                  |
| -------------- | ------- | ------------ | ------------------------------------------ | ------------------------ |
| type           | string  | **Required** | `custom:timer-card`                        |                          |
| entity         | string  | **Required** | Your timer entity                          |                          |
| name           | string  | **Optional** | Header. Set to `false` to disable          | Entity name              |
| icons          | `icons` | **Optional** | List of icons to show (see below)          | - icon: 'mdi:timer'      |
|                |         |              |                                            |   percent: 0             |
| loop_duration  | number  | **Optional** | Length of a single loop in seconds         | Total seconds in timer   |

### Icons

Icons is a way to set multiple icons during the duration of the timer.
The percent option is at what percent of a loop this icon will be displayed.
The length of the loop can be changed with the `loop_duration` option.
The default value is the entire duration of the time, so only one loop will take place.

This allows you to for example change the icon when the timer is almost done (or done)

```yaml
entity: timer.tea
icons:
  - icon: 'mdi:kettle-outline'
    percent: 0
  - icon: 'mdi:kettle-steam-outline'
    percent: 90
```

For example if you wanted to have a stopwatch style animation you could do something like this:

```yaml
entity: timer.my_timer
loop_duration: 60
icons:
  - icon: 'mdi:clock-time-twelve-outline'
    percent: 0
  - icon: 'mdi:clock-time-three-outline'
    percent: 25
  - icon: 'mdi:clock-time-six-outline'
    percent: 50
  - icon: 'mdi:clock-time-nine-outline'
    percent: 75
  - icon: 'mdi:clock-time-twelve-outline'
    percent: 100
```

## Installation

### Add to resources

```yaml
- url: /hacsfiles/lovelace-timer-card/timer-card.js
  type: module
```

### Add to Lovelace

Just add the card to your lovelace. It might look something like this:

```yaml
- type: custom:timer-card
  entity: timer.tea
```

You might want to only show active timers too. So you could use it in conjunction with the conditional card like this:

```yaml
- type: conditional
  conditions:
    - entity: timer.tea
      state_not: "idle"
  card:
    type: custom:timer-card
    entity: timer.tea
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

Parts of this are based off the [timer card](https://github.com/custom-cards/timer-card) that doesn't seem to be maintained anymore
