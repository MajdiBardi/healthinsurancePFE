import * as React from 'react';
import type { Metadata } from 'next';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';

import { config } from '@/config';
import { paths } from '@/paths';

export const metadata = { title: `Not found | Errors | ${config.site.name}` } satisfies Metadata;

export default function NotFound(): React.JSX.Element {
  return (
    <iframe title="Vision analytics Free Sales Dashboard Template" width="100%" height="100%" src="https://app.powerbi.com/reportEmbed?reportId=80958b73-f1ca-4d77-a130-eae24bf19eaf&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730" frameBorder="0" allowFullScreen></iframe>
  );
}
