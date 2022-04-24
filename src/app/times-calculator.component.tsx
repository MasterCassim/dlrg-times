import React, { useMemo, useState } from 'react';
import { MaskedTextField, TextField } from '@fluentui/react';
import { memoComponent } from '../util/memo-component';

export interface TimesCalculatorProps {}

const DEFAULT_VALUE: Record<number, [string, string, string, string]> = {
    1: ['', '', '', ''],
    2: ['', '', '', ''],
    3: ['', '', '', ''],
    4: ['', '', '', ''],
    5: ['', '', '', ''],
};

function permutator<T>(inputArr: T[]) {
    const result: T[][] = [];

    const permute = (arr: T[], m: T[] = []) => {
        if (arr.length === 0) {
            result.push(m);
        } else {
            for (let i = 0; i < arr.length; i++) {
                const curr = arr.slice();
                const next = curr.splice(i, 1);
                permute(curr.slice(), m.concat(next));
            }
        }
    };

    permute(inputArr);

    return result;
}

function convertToString(timeInSeconds: number) {
    const minutes = Math.floor(timeInSeconds / 60);
    const remainingSeconds = timeInSeconds - minutes * 60;
    const seconds = Math.floor(remainingSeconds);
    const milliSeconds = 1000 * (remainingSeconds - seconds);
    return `${minutes}:${seconds},${`${milliSeconds}`.substring(0, 2)}`;
}

function convertToSeconds(value?: string) {
    if (value == null || value.length === 0) {
        return null;
    }

    if (value.indexOf(':') < 0 || value.indexOf(',') < 0) {
        return null;
    }

    const split = value.split(':');
    if (split.length !== 2) {
        return null;
    }

    const minutes = parseInt(split[0], 10);
    const split2 = split[1].split(',');
    if (minutes >= 60 || split2.length !== 2) {
        return null;
    }

    const seconds = parseInt(split2[0], 10);
    const milliSeconds = parseInt(split2[1], 10) * 10;

    if (seconds >= 60 || milliSeconds >= 1000) {
        return null;
    }
    return minutes * 60 + seconds + milliSeconds / 1000;
}

export const TimesCalculator: React.FC<TimesCalculatorProps> = memoComponent('TimesCalculator', () => {
    const [names, setNames] = useState<[string, string, string, string, string]>(['1', '2', '3', '4', '5']);
    const [times, setTimes] = useState<Record<number, [string, string, string, string]>>(DEFAULT_VALUE);

    const bestTimes = useMemo(() => {
        const computesTimes: { timeInSeconds: number; permutation: number[] }[] = [];

        for (let i1 = 0; i1 < 5; ++i1) {
            const time1 = i1 === 4 ? null : convertToSeconds(times[1][i1]);
            for (let i2 = 0; i2 < 5; ++i2) {
                const time2 = i2 === 4 ? null : convertToSeconds(times[2][i2]);
                for (let i3 = 0; i3 < 5; ++i3) {
                    const time3 = i3 === 4 ? null : convertToSeconds(times[3][i3]);
                    for (let i4 = 0; i4 < 5; ++i4) {
                        const time4 = i4 === 4 ? null : convertToSeconds(times[4][i4]);
                        for (let i5 = 0; i5 < 5; ++i5) {
                            const time5 = i5 === 4 ? null : convertToSeconds(times[5][i5]);
                            if ([time1, time2, time3, time4, time5].filter((time) => time != null).length !== 4) {
                                continue;
                            }

                            const permutation = [i1, i2, i3, i4, i5];
                            if (
                                permutation.indexOf(0) < 0
                                || permutation.indexOf(1) < 0
                                || permutation.indexOf(2) < 0
                                || permutation.indexOf(3) < 0
                                || permutation.indexOf(4) < 0
                            ) {
                                continue;
                            }

                            const timeInSeconds = (time1 ?? 0) + (time2 ?? 0) + (time3 ?? 0) + (time4 ?? 0) + (time5 ?? 0);
                            computesTimes.push({ timeInSeconds, permutation });
                        }
                    }
                }
            }
        }

        return computesTimes.sort((a, b) => a.timeInSeconds - b.timeInSeconds);
    }, [times]);

    return (
        <>
            <table style={{ width: '100%' }}>
                <thead>
                    <tr style={{ width: '100%' }}>
                        <th style={{ width: '20%' }}>Schwimmer</th>
                        <th style={{ width: '20%' }}>Zeit 1</th>
                        <th style={{ width: '20%' }}>Zeit 2</th>
                        <th style={{ width: '20%' }}>Zeit 3</th>
                        <th style={{ width: '20%' }}>Zeit 4</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(times).map(([i, iTimes]) => (
                        <tr key={i}>
                            <th>
                                <TextField
                                    value={names[Number(i) - 1]}
                                    onChange={(evt, changedValue) => changedValue
                                        && setNames((oldNames) => {
                                            const copyNames: [string, string, string, string, string] = [...oldNames];
                                            copyNames[Number(i) - 1] = changedValue;
                                            return copyNames;
                                        })
                                    }
                                />
                            </th>
                            {iTimes.map((value, j) => (
                                <th>
                                    <MaskedTextField
                                        mask="99:99,99"
                                        value={value}
                                        invalid={convertToSeconds(value) == null}
                                        onChange={(ev, changedValue) => changedValue
                                            && setTimes((oldTimes) => {
                                                const base: Record<number, [string, string, string, string]> = {
                                                    ...oldTimes,
                                                    [i]: [...oldTimes[Number(i)]],
                                                };

                                                base[Number(i)][j] = changedValue;
                                                return base;
                                            })
                                        }
                                    />
                                </th>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {bestTimes.length > 0 && (
                <table style={{ width: '100%', marginTop: 24 }}>
                    <tbody>
                        {bestTimes.map((o, i) => {
                            if (i >= 10) {
                                return null;
                            }

                            const first = o.permutation.findIndex((v) => v === 0);
                            const second = o.permutation.findIndex((v) => v === 1);
                            const third = o.permutation.findIndex((v) => v === 2);
                            const fourth = o.permutation.findIndex((v) => v === 3);

                            return (
                                <tr>
                                    <th style={{ width: '20%' }}>{convertToString(o.timeInSeconds)}</th>
                                    <th style={{ width: '20%' }}>{names[first]}</th>
                                    <th style={{ width: '20%' }}>{names[second]}</th>
                                    <th style={{ width: '20%' }}>{names[third]}</th>
                                    <th style={{ width: '20%' }}>{names[fourth]}</th>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </>
    );
});
