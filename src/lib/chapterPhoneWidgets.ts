import type { PuzzleChapter } from '../types';

export interface AgendaEntry {
  time: string;
  title: string;
  place: string;
}

export interface ChapterPhoneWidgetState {
  clock: string;
  weather: {
    temperature: number;
    condition: string;
    high: number;
    low: number;
    updated: string;
    background: string;
    temperatureColor: string;
    moonColor: string;
    moonMask: string;
  };
  agenda: {
    dayLabel: string;
    entries: readonly AgendaEntry[];
    footer: string;
    background: string;
    accent: string;
  };
}

const AGENDA_TIMELINE: readonly AgendaEntry[] = [
  { time: '19:30', title: 'Groceries', place: 'On the way back' },
  { time: '20:30', title: 'Dinner', place: 'Leftovers' },
  { time: '21:15', title: 'Laundry', place: 'Delicate cycle' },
  { time: '22:00', title: 'Take out bins', place: 'Side alley' },
  { time: '22:45', title: 'Shower', place: 'Quick rinse' },
  { time: '23:30', title: 'Set alarm', place: '07:30' },
  { time: '00:15', title: 'Bedtime', place: 'Do Not Disturb' },
  { time: '01:00', title: 'Cloud backup', place: 'Automatic' },
  { time: '02:00', title: 'Night mode', place: 'Until 07:30' },
  { time: '03:30', title: 'Quiet hours', place: 'Home' },
  { time: '05:30', title: 'Heating cycle', place: 'Automatic' },
  { time: '06:30', title: 'Coffee timer', place: 'Kitchen' },
];

const remainingAgenda = (start: number): readonly AgendaEntry[] =>
  AGENDA_TIMELINE.slice(start);

const CHAPTER_WIDGETS: Record<PuzzleChapter, ChapterPhoneWidgetState> = {
  1: {
    clock: '19:48',
    weather: {
      temperature: 13, condition: 'Clear evening', high: 17, low: 9, updated: 'Updated 2m ago',
      background: 'linear-gradient(145deg, rgba(42,55,82,0.94), rgba(23,29,43,0.98))',
      temperatureColor: '#f2f5fb', moonColor: '#ddd5ad', moonMask: '#222b40',
    },
    agenda: {
      dayLabel: 'WED 12', entries: remainingAgenda(0), footer: '12 QUEUED · SILENT',
      background: 'linear-gradient(150deg, rgba(51,54,73,0.94), rgba(27,30,43,0.98))',
      accent: 'rgba(125,145,184,0.46)',
    },
  },
  2: {
    clock: '20:36',
    weather: {
      temperature: 13, condition: 'Clear night', high: 17, low: 9, updated: 'Updated 3m ago',
      background: 'linear-gradient(145deg, rgba(37,69,82,0.94), rgba(20,37,48,0.98))',
      temperatureColor: '#edf8f7', moonColor: '#d8d7b3', moonMask: '#203d49',
    },
    agenda: {
      dayLabel: 'WED 12', entries: remainingAgenda(1), footer: '11 QUEUED · SILENT',
      background: 'linear-gradient(150deg, rgba(42,65,72,0.94), rgba(24,35,42,0.98))',
      accent: 'rgba(105,161,168,0.46)',
    },
  },
  3: {
    clock: '21:24',
    weather: {
      temperature: 12, condition: 'Clouds gathering', high: 16, low: 9, updated: 'Updated 4m ago',
      background: 'linear-gradient(145deg, rgba(52,67,93,0.94), rgba(29,38,55,0.98))',
      temperatureColor: '#eef3fb', moonColor: '#d8d9c5', moonMask: '#313e57',
    },
    agenda: {
      dayLabel: 'WED 12', entries: remainingAgenda(2), footer: '10 QUEUED · SILENT',
      background: 'linear-gradient(150deg, rgba(55,61,82,0.94), rgba(28,32,47,0.98))',
      accent: 'rgba(129,145,190,0.46)',
    },
  },
  4: {
    clock: '22:13',
    weather: {
      temperature: 12, condition: 'Overcast', high: 16, low: 8, updated: 'Updated 4m ago',
      background: 'linear-gradient(145deg, rgba(48,53,85,0.94), rgba(25,28,49,0.98))',
      temperatureColor: '#f1f0fb', moonColor: '#d8d3c2', moonMask: '#2d3250',
    },
    agenda: {
      dayLabel: 'WED 12', entries: remainingAgenda(3), footer: '9 QUEUED · SILENT',
      background: 'linear-gradient(150deg, rgba(57,51,77,0.94), rgba(30,27,43,0.98))',
      accent: 'rgba(157,132,188,0.46)',
    },
  },
  5: {
    clock: '23:02',
    weather: {
      temperature: 11, condition: 'Heavy overcast', high: 15, low: 8, updated: 'Updated 5m ago',
      background: 'linear-gradient(145deg, rgba(44,48,75,0.94), rgba(23,26,42,0.98))',
      temperatureColor: '#edeefa', moonColor: '#d7cfbb', moonMask: '#292d47',
    },
    agenda: {
      dayLabel: 'WED 12', entries: remainingAgenda(4), footer: '8 QUEUED · SILENT',
      background: 'linear-gradient(150deg, rgba(64,51,70,0.94), rgba(32,26,39,0.98))',
      accent: 'rgba(175,126,161,0.44)',
    },
  },
  6: {
    clock: '00:07',
    weather: {
      temperature: 10, condition: 'First rain', high: 15, low: 8, updated: 'Updated 6m ago',
      background: 'linear-gradient(145deg, rgba(48,43,70,0.94), rgba(23,22,37,0.98))',
      temperatureColor: '#f0ebf6', moonColor: '#d9c8bd', moonMask: '#2d2943',
    },
    agenda: {
      dayLabel: 'THU 13', entries: remainingAgenda(5), footer: '7 QUEUED · SILENT',
      background: 'linear-gradient(150deg, rgba(58,45,66,0.94), rgba(29,24,38,0.98))',
      accent: 'rgba(167,123,168,0.46)',
    },
  },
  7: {
    clock: '00:52',
    weather: {
      temperature: 10, condition: 'Heavy rain', high: 14, low: 8, updated: 'Updated 6m ago',
      background: 'linear-gradient(145deg, rgba(41,45,76,0.94), rgba(21,24,39,0.98))',
      temperatureColor: '#ebeff9', moonColor: '#d7d2c6', moonMask: '#272b48',
    },
    agenda: {
      dayLabel: 'THU 13', entries: remainingAgenda(6), footer: '6 QUEUED · SILENT',
      background: 'linear-gradient(150deg, rgba(44,46,72,0.94), rgba(24,25,40,0.98))',
      accent: 'rgba(125,132,186,0.46)',
    },
  },
  8: {
    clock: '01:41',
    weather: {
      temperature: 9, condition: 'Driving rain', high: 14, low: 7, updated: 'Updated 7m ago',
      background: 'linear-gradient(145deg, rgba(33,55,74,0.94), rgba(18,31,44,0.98))',
      temperatureColor: '#e8f4f8', moonColor: '#d7dde0', moonMask: '#203647',
    },
    agenda: {
      dayLabel: 'THU 13', entries: remainingAgenda(7), footer: '5 QUEUED · SILENT',
      background: 'linear-gradient(150deg, rgba(37,55,65,0.94), rgba(21,31,39,0.98))',
      accent: 'rgba(101,155,174,0.46)',
    },
  },
  9: {
    clock: '02:34',
    weather: {
      temperature: 8, condition: 'Gale warning', high: 13, low: 6, updated: 'Updated 8m ago',
      background: 'linear-gradient(145deg, rgba(25,36,52,0.96), rgba(12,17,27,0.99))',
      temperatureColor: '#edf1f5', moonColor: '#e0d5ca', moonMask: '#253142',
    },
    agenda: {
      dayLabel: 'THU 13', entries: remainingAgenda(8), footer: '4 QUEUED · SILENT',
      background: 'linear-gradient(150deg, rgba(46,50,61,0.94), rgba(27,29,37,0.98))',
      accent: 'rgba(145,151,171,0.42)',
    },
  },
  10: {
    clock: '03:40',
    weather: {
      temperature: 8, condition: 'Violent storm', high: 13, low: 6, updated: 'Updated 9m ago',
      background: 'linear-gradient(145deg, rgba(17,26,40,0.97), rgba(7,10,18,0.995))',
      temperatureColor: '#e8eef7', moonColor: '#8d98a8', moonMask: '#111a28',
    },
    agenda: {
      dayLabel: 'THU 13', entries: remainingAgenda(9), footer: '3 LEFT · DEEP NIGHT',
      background: 'linear-gradient(150deg, rgba(28,34,49,0.97), rgba(12,16,25,0.995))',
      accent: 'rgba(103,129,166,0.42)',
    },
  },
};

export function getChapterPhoneWidgetState(chapter: PuzzleChapter): ChapterPhoneWidgetState {
  return CHAPTER_WIDGETS[chapter];
}
