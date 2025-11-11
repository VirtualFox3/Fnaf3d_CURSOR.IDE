export interface VideoItem {
  id: string;
  title: string;
  channel: string;
  duration: number; // seconds
  thumbnail: string;
  description?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
  coverImage?: string;
  videos: VideoItem[];
}

const ytThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export const seededPlaylists: Playlist[] = [
  {
    id: 'focus-vibes',
    title: 'Focus Vibes',
    description: 'Muted, atmospheric tunes to help you sink into deep work without distractions.',
    updatedAt: '2024-06-11T09:34:00.000Z',
    coverImage: ytThumb('hHW1oY26kxQ'),
    videos: [
      {
        id: 'hHW1oY26kxQ',
        title: 'Chillhop Essentials - Spring 2024 🌱 (lofi hip hop beats)',
        channel: 'Chillhop Music',
        duration: 4410,
        thumbnail: ytThumb('hHW1oY26kxQ')
      },
      {
        id: 'DWcJFNfaw9c',
        title: 'Synthwave Radio 🌌 (Chillwave / Retrowave)',
        channel: 'ThePrimeThanatos',
        duration: 5400,
        thumbnail: ytThumb('DWcJFNfaw9c')
      },
      {
        id: 'jfKfPfyJRdk',
        title: 'lofi hip hop radio 📚 - beats to study/relax to',
        channel: 'Lofi Girl',
        duration: 3600,
        thumbnail: ytThumb('jfKfPfyJRdk')
      },
      {
        id: 'ypLq-yc-5V4',
        title: 'Ocean Deep — Ambient Waves for Focus',
        channel: 'ToneSci',
        duration: 2700,
        thumbnail: ytThumb('ypLq-yc-5V4')
      },
      {
        id: '84WIaK3bl_s',
        title: 'Tokyo Neon Nights — Future Funk Mix',
        channel: 'Asthenic',
        duration: 2964,
        thumbnail: ytThumb('84WIaK3bl_s')
      }
    ]
  },
  {
    id: 'lift-off',
    title: 'Lift Off',
    description: 'Up-tempo tracks for creative sprints, from electronic bangers to math rock.',
    updatedAt: '2024-07-22T17:12:00.000Z',
    coverImage: ytThumb('sn74SKMUkJ4'),
    videos: [
      {
        id: 'sn74SKMUkJ4',
        title: 'TWRP - Stellar Dreams (Full Album)',
        channel: 'TWRP',
        duration: 2380,
        thumbnail: ytThumb('sn74SKMUkJ4')
      },
      {
        id: 'Y66j_BUCBMY',
        title: 'ODESZA - A Moment Apart (Full Album Visualizer)',
        channel: 'ODESZA',
        duration: 3868,
        thumbnail: ytThumb('Y66j_BUCBMY')
      },
      {
        id: 'cEB1F9XIf7M',
        title: 'Polyphia - Playing God (Official Music Video)',
        channel: 'Polyphia',
        duration: 237,
        thumbnail: ytThumb('cEB1F9XIf7M')
      },
      {
        id: 'v9W8iCr0nXU',
        title: 'Snail Mail - Pristine',
        channel: 'Snail Mail',
        duration: 259,
        thumbnail: ytThumb('v9W8iCr0nXU')
      },
      {
        id: 'wqlPMN5PKrc',
        title: 'Misterwives - Rock Bottom (Alt Version)',
        channel: 'MisterWives',
        duration: 232,
        thumbnail: ytThumb('wqlPMN5PKrc')
      }
    ]
  },
  {
    id: 'wind-down',
    title: 'Wind Down Library',
    description: 'Evening listens with soft acoustic textures and piano-led instrumentals.',
    updatedAt: '2024-05-30T21:45:00.000Z',
    coverImage: ytThumb('pXRviuL6vMY'),
    videos: [
      {
        id: 'pXRviuL6vMY',
        title: 'twenty one pilots: Ride [OFFICIAL VIDEO]',
        channel: 'twenty one pilots',
        duration: 251,
        thumbnail: ytThumb('pXRviuL6vMY')
      },
      {
        id: 'v7bnOxV4jAc',
        title: 'Laufey - From The Start (Official Music Video)',
        channel: 'Laufey',
        duration: 198,
        thumbnail: ytThumb('v7bnOxV4jAc')
      },
      {
        id: 'XB6lG9VX3BA',
        title: 'Cigarettes After Sex - Apocalypse',
        channel: 'Cigarettes After Sex',
        duration: 265,
        thumbnail: ytThumb('XB6lG9VX3BA')
      },
      {
        id: 'q_4wT9v2cTk',
        title: 'Novo Amor - Anchor (official video)',
        channel: 'Novo Amor',
        duration: 230,
        thumbnail: ytThumb('q_4wT9v2cTk')
      },
      {
        id: 'PvF9PAxe5Ng',
        title: 'Ólafur Arnalds - near light',
        channel: 'Ólafur Arnalds',
        duration: 302,
        thumbnail: ytThumb('PvF9PAxe5Ng')
      }
    ]
  }
];
