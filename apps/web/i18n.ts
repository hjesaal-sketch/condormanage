import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
  timeZone: 'America/Caracas',
  formats: {
    number: {
      currency: {
        style: 'currency',
        currency: 'USD',
      },
    },
    dateTime: {
      long: {
        dateStyle: 'full',
        timeStyle: 'short',
      },
      short: {
        dateStyle: 'short',
        timeStyle: 'short',
      },
    },
  },
}));