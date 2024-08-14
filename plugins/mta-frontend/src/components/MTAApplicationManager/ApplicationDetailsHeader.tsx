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
import { useIsMutating } from '@tanstack/react-query';

interface ApplicationDetailsHeaderProps {
  application: Application;
  setApplication: (application: Application) => void;
  isWaiting: boolean;
  setIsWaiting: (isWaiting: boolean) => void;
}

export const ApplicationDetailsHeader = ({
  application,
  setApplication,
  isWaiting,
  setIsWaiting,
}: ApplicationDetailsHeaderProps) => {
  const isMutating = useIsMutating();
  const { identities, isFetching } = useFetchIdentities();
  if (isFetching || isMutating || isWaiting) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }
  return (
    <ApplicationDetailsForm
      application={application}
      setApplication={setApplication}
      identities={identities || []}
      isLoadingIdentities={isFetching}
      setIsWaiting={setIsWaiting}
      isWaiting={isWaiting}
    />
  );
};

export default ApplicationDetailsHeader;
