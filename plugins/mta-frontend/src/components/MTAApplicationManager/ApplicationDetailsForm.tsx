import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Grid,
  Typography,
  Link,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@material-ui/core';
import { Application, Identity, Ref } from '../../api/api';
import { LinkButton } from '@backstage/core-components';
import { useFetchIdentities, useUpdateApplication } from '../../queries/mta';

interface ApplicationDetailsFormProps {
  application: Application;
  identities: Identity[];
  isLoadingIdentities: boolean;
}

export const ApplicationDetailsForm = ({
  application,
  identities,
  isLoadingIdentities,
}: ApplicationDetailsFormProps) => {
  const getDefaultIdentityValue = (appIdentities: Ref[], kind: string) => {
    // Just find the first matching identity from the full list that matches any from the app's list
    const appIdentityRef = appIdentities?.find(appIdentity =>
      identities?.some(
        identity => identity.id === appIdentity.id && identity.kind === kind,
      ),
    );

    return appIdentityRef ? appIdentityRef.name : 'None';
  };

  // You'd have these kinds of checks or transformations in a useEffect or similar lifecycle method if the data isn't synchronous
  const defaultSourceIdentity = identities
    ? getDefaultIdentityValue(application.identities || [], 'source')
    : 'None';
  const defaultMavenIdentity = identities
    ? getDefaultIdentityValue(application.identities || [], 'maven')
    : 'None';

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    getValues,
  } = useForm({
    defaultValues: useMemo(() => {
      return {
        name: application.name,
        repositoryUrl: application?.repository?.url || '',
        sourceCredentials: defaultSourceIdentity,
        mavenCredentials: defaultMavenIdentity,
      };
    }, [application, identities, defaultSourceIdentity, defaultMavenIdentity]),

    mode: 'onSubmit', // Validation will trigger on the change event with each input field
  });

  const sourceCredentials = watch('sourceCredentials');
  const mavenCredentials = watch('mavenCredentials');
  const name = watch('name');
  const repositoryUrl = watch('repositoryUrl');

  const sourceIdentityOptions = identities
    ?.filter(identity => identity.kind === 'source')
    .map(identity => ({
      value: identity.name,
      label: identity.name,
      id: identity.id,
    }));
  const mavenIdentityOptions = identities
    ?.filter(identity => identity.kind === 'maven')
    ?.map(identity => ({
      value: identity.name,
      label: identity.name,
      id: identity.id,
    }));
  const { mutate: updateApplication } = useUpdateApplication();

  const onSubmit = (formData: any) => {
    const findIdentityByName = (identityName: string) => {
      return identities?.find(option => option.name === identityName);
    };

    const mavenIdentity =
      formData.mavenCredentials !== 'None'
        ? findIdentityByName(formData.mavenCredentials)
        : null;

    const sourceIdentity =
      formData.sourceCredentials !== 'None'
        ? findIdentityByName(formData.sourceCredentials)
        : null;

    const updatedApplication: Application = {
      ...application,
      name: formData.name,
      repository: {
        url: formData.repositoryUrl,
      },
      identities: [
        ...(mavenIdentity
          ? [{ id: mavenIdentity.id, name: mavenIdentity.name }]
          : []),
        ...(sourceIdentity
          ? [{ id: sourceIdentity.id, name: sourceIdentity.name }]
          : []),
      ],
    };

    updateApplication(updatedApplication);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom style={{ fontWeight: 400 }}>
            Application Details
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Application name is required' }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                fullWidth
                label="Application Name"
                variant="outlined"
                error={!!error}
                helperText={error ? error.message : null}
                {...field}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="repositoryUrl"
            control={control}
            rules={{ required: 'Repository URL is required' }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                fullWidth
                label="Repository URL"
                variant="outlined"
                error={!!error}
                helperText={error ? error.message : null}
                InputProps={{
                  endAdornment: (
                    <Link component={LinkButton} to={field.value}>
                      Visit
                    </Link>
                  ),
                }}
                {...field}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.sourceCredentials}>
            <InputLabel>Source Credentials</InputLabel>
            <Controller
              name="sourceCredentials"
              control={control}
              rules={{ required: 'Source credentials are required' }}
              render={({ field, fieldState: { error } }) => (
                <Select {...field} label="Source Credentials">
                  {sourceIdentityOptions?.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.sourceCredentials && (
              <Typography color="error">
                {errors.sourceCredentials.message}
              </Typography>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.mavenCredentials}>
            <InputLabel>Maven Credentials</InputLabel>
            <Controller
              name="mavenCredentials"
              control={control}
              rules={{ required: 'Maven credentials are required' }}
              render={({ field, fieldState: { error } }) => (
                <Select {...field} label="Maven Credentials">
                  {mavenIdentityOptions?.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.mavenCredentials && (
              <Typography color="error">
                {errors.mavenCredentials.message}
              </Typography>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={
              isSubmitting ||
              Object.keys(errors).length > 0 ||
              !sourceCredentials ||
              !mavenCredentials ||
              !name ||
              !repositoryUrl
            }
          >
            Update
          </Button>
        </Grid>
        {isSubmitting && (
          <Grid item xs={12}>
            <CircularProgress />
            <Typography>Updating...</Typography>
          </Grid>
        )}
      </Grid>
    </form>
  );
};

export default ApplicationDetailsForm;
