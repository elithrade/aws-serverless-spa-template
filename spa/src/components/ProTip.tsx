import * as React from 'react';
import Link from '@mui/material/Link';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { Lightbulb } from '@mui/icons-material';

export default function ProTip() {
  return (
    <Typography sx={{ mt: 6, mb: 3 }} color='text.secondary'>
      <Lightbulb sx={{ mr: 1, verticalAlign: 'middle' }} />
      Pro tip: See more{' '}
      <Link href='https://mui.com/getting-started/templates/'>
        templates
      </Link>{' '}
      on the MUI documentation.
    </Typography>
  );
}
