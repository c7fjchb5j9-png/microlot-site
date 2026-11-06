// Общие функции для расписания. Используются и при сборке (render.js), и в браузере (main.js).

export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const SHORT = { mon: 'пн', tue: 'вт', wed: 'ср', thu: 'чт', fri: 'пт', sat: 'сб', sun: 'вс' };

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Группирует дни с одинаковыми часами: [{days:'пн–пт', hours:'07:30–21:00'}] */
export function groupSchedule(schedule) {
  const groups = [];
  DAYS.forEach((d) => {
    const v = schedule[d];
    const hours = v ? `${v[0]}–${v[1]}` : 'выходной';
    const last = groups[groups.length - 1];
    if (last && last.hours === hours) last.to = d;
    else groups.push({ from: d, to: d, hours });
  });
  if (groups.length === 1) return [{ days: 'ежедневно', hours: groups[0].hours }];
  return groups.map((g) => ({
    days: g.from === g.to ? SHORT[g.from] : `${SHORT[g.from]}–${SHORT[g.to]}`,
    hours: g.hours,
  }));
}

export function scheduleText(schedule, sep = ' · ') {
  return groupSchedule(schedule)
    .map((g) => `${g.days} ${g.hours}`)
    .join(sep);
}

/** Текущее время в Москве: { day: 'mon', minutes: 812 } */
export function moscowNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Moscow',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t).value;
  const day = get('weekday').toLowerCase().slice(0, 3);
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

/** Статус точки: { open: bool, text: 'Открыто до 21:00' | 'Закрыто, откроемся в 07:30' } */
export function status(schedule, date = new Date()) {
  const { day, minutes } = moscowNow(date);
  const idx = DAYS.indexOf(day);
  const today = schedule[day];
  if (today && minutes >= toMin(today[0]) && minutes < toMin(today[1])) {
    return { open: true, text: `Открыто до ${today[1]}` };
  }
  if (today && minutes < toMin(today[0])) {
    return { open: false, text: `Закрыто, откроемся в ${today[0]}` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = DAYS[(idx + i) % 7];
    const v = schedule[d];
    if (v) {
      const when = i === 1 ? 'завтра' : `в ${SHORT[d]}`;
      return { open: false, text: `Закрыто, откроемся ${when} в ${v[0]}` };
    }
  }
  return { open: false, text: 'Закрыто' };
}
