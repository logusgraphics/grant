'use client';

import { NextIntlClientProvider } from 'next-intl';
import { AbstractIntlMessages } from 'next-intl';
import { PropsWithChildren } from 'react';

interface MessagesProviderProps extends PropsWithChildren {
  locale: string;
  messages: AbstractIntlMessages;
}

export function MessagesProvider({ children, locale, messages }: MessagesProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
