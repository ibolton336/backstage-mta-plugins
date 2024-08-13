import React from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
} from '@material-ui/core';
import { useForm, Controller, Form } from 'react-hook-form';
import {
  useFetchTargets,
  useAnalyzeApplication,
  useFetchIdentities,
} from '../../queries/mta';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Application } from '../../api/api';

interface IFormInput {
  type: string;
  targetList: string[];
  sourceCredentials?: string;
  mavenCredentials?: string;
}

export const AnalysisPage = () => {
  const { control, handleSubmit, watch } = useForm<IFormInput>({
    defaultValues: {
      type: '',
      targetList: [],
    },
  });
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const entity = useEntity();

  const { targets } = useFetchTargets();
  const { identities } = useFetchIdentities();

  const { mutate: analyzeApp } = useAnalyzeApplication({});

  const sourceIdentityOptions = identities
    ? [
        ...identities
          .filter(identity => identity.kind === 'source')
          .map(sourceIdentity => ({
            value: sourceIdentity.name,
            toString: () => sourceIdentity.name,
          })),
        { value: 'none', toString: () => 'None' }, // Adding the 'None' option
      ]
    : [{ value: 'none', toString: () => 'None' }];

  const mavenIdentityOptions = identities
    ? [
        ...identities
          .filter(identity => identity.kind === 'maven')
          .map(maven => ({
            value: maven.name,
            toString: () => maven.name,
          })),
        { value: 'none', toString: () => 'None' }, // Adding the 'None' option
      ]
    : [{ value: 'none', toString: () => 'None' }];

  const labelOptions = targets
    ? targets?.flatMap(target =>
        target?.labels?.map(label => ({
          label: label.label,
          name: label?.name || '',
        })),
      )
    : [];

  const [type, targetList, sourceCredentials, mavenCredentials] = watch([
    'type',
    'targetList',
    'sourceCredentials',
    'mavenCredentials',
  ]);
  const enableAnalysis =
    type && targetList.length > 0 && sourceCredentials && mavenCredentials;

  const onSubmit = (data: IFormInput) => {
    setIsAnalyzing(true);
    const app = entity.entity.metadata.application as unknown as Application;
    const analysisParams = {
      selectedApp: app.id,
      analysisOptions: {
        type: data.type,
        targetList: data.targetList,
        application: app,
      },
    };

    analyzeApp(analysisParams);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000); // Simulates 2 seconds of analysis
  };
  return (
    <Box sx={{ width: '100%', padding: 4 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Type</InputLabel>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Type"
                // onChange={e => setValue('type', e.target.value)}
              >
                {['Source', 'Source + Dependencies'].map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Target List</InputLabel>
          <Controller
            name="targetList"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Target List"
                multiple
                // onChange={e => setValue('targetList', e.target.value)}
                // renderValue={selected => selected.join(', ')}
              >
                {labelOptions.map(label => (
                  <MenuItem key={label?.label} value={label?.label}>
                    {label?.name || ''}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Source credentials</InputLabel>
          <Controller
            name="sourceCredentials"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Source credentials"
                // onChange={e => setValue('type', e.target.value)}
              >
                {sourceIdentityOptions?.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.toString()}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Maven credentials</InputLabel>
          <Controller
            name="mavenCredentials"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Maven credentials"
                // onChange={e => setValue('type', e.target.value)}
              >
                {mavenIdentityOptions?.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.toString()}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          disabled={!enableAnalysis}
          style={{ marginTop: '15px' }}
        >
          Analyze
        </Button>
      </form>
      {isAnalyzing && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <CircularProgress />
          <Box sx={{ ml: 2 }}>Analyzing...</Box>
        </Box>
      )}
    </Box>
  );
};
