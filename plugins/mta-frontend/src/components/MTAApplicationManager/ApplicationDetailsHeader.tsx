import React from 'react';
import { Box, Typography, Link, Grid } from '@material-ui/core';
import { LinkButton } from '@backstage/core-components';
import { Application } from '../../api/api';

interface ApplicationDetailsHeaderProps {
  application: Application;
}

export const ApplicationDetailsHeader = ({
  application,
}: ApplicationDetailsHeaderProps) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom style={{ fontWeight: 400 }}>
          Application Name: {application.name}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        {application?.repository?.url && (
          <Typography variant="body1" gutterBottom style={{ fontWeight: 400 }}>
            Repository URL:
            <Link
              component={LinkButton}
              to={application?.repository.url}
              style={{ marginLeft: 8, fontWeight: 400 }}
            >
              {application?.repository.url}
            </Link>
          </Typography>
        )}
      </Grid>
    </Grid>
  );
};

export default ApplicationDetailsHeader;
