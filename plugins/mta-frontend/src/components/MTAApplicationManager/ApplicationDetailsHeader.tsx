import React from 'react';
import {
  Box,
  Typography,
  Link,
  Grid,
  CircularProgress,
} from '@material-ui/core';
import { LinkButton } from '@backstage/core-components';
import { Application } from '../../api/api';
import { ApplicationDetailsForm } from './ApplicationDetailsForm';
import { useFetchIdentities } from '../../queries/mta';

interface ApplicationDetailsHeaderProps {
  application: Application;
}

export const ApplicationDetailsHeader = ({
  application,
}: ApplicationDetailsHeaderProps) => {
  const { identities, isFetching } = useFetchIdentities();
  if (isFetching) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }
  return (
    <ApplicationDetailsForm
      application={application}
      identities={identities || []}
      isLoadingIdentities={isFetching}
    />
  );
};

export default ApplicationDetailsHeader;
