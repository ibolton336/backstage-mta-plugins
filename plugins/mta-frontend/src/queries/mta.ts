import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Application,
  Identity,
  mtaApiRef,
  Target,
  TaskDashboard,
} from '../api/api';
import { useApi } from '@backstage/core-plugin-api';

export const TargetsQueryKey = 'targets';

export const useUpdateApplication = (onSuccess?: () => void) => {
  const api = useApi(mtaApiRef);
  const queryClient = useQueryClient();

  const updateApplication = async (application: Application) => {
    return await api.updateApplication(application);
  };

  const mutation = useMutation<any, Error, any>({
    mutationFn: updateApplication,
    onSuccess: data => {
      queryClient.invalidateQueries();
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: error => {
      throw new Error('Error updating application');
    },
  });

  return mutation;
};

export const useFetchTargets = () => {
  const api = useApi(mtaApiRef);
  const { isLoading, error, data, isError } = useQuery<Target[]>({
    queryKey: ['targets'],
    queryFn: () => api.getTargets(),
  });

  return {
    targets: data,
    isFetching: isLoading,
    fetchError: error,
    isError: isError,
  };
};

interface AnalyzeApplicationParams {
  selectedApp: string;
  analysisOptions: any;
}
interface UseAnalyzeApplicationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
export const useAnalyzeApplication = (
  options?: UseAnalyzeApplicationOptions,
) => {
  const api = useApi(mtaApiRef);
  const queryClient = useQueryClient();

  const analyzeApplications = async ({
    selectedApp,
    analysisOptions,
  }: AnalyzeApplicationParams) => {
    return await api.analyzeMTAApplications(selectedApp, analysisOptions);
  };

  const mutation = useMutation<
    AnalyzeApplicationParams | URL,
    Error,
    AnalyzeApplicationParams
  >({
    mutationFn: analyzeApplications,
    onSuccess: data => {
      if (options?.onSuccess) {
        options.onSuccess();
        queryClient.invalidateQueries();
      }
    },
  });

  return mutation;
};
export const useFetchIdentities = () => {
  const api = useApi(mtaApiRef);
  const { isLoading, error, data, isError, refetch } = useQuery<Identity[]>({
    queryKey: ['credentials'],
    queryFn: () => api.getIdentities(),
    select: identityData => [
      { id: 999999, name: 'None', kind: 'source' },
      { id: 9999999, name: 'None', kind: 'maven' },
      ...identityData,
    ],
  });

  return {
    identities: data,
    isFetching: isLoading,
    fetchError: error,
    isError: isError,
    refetch,
  };
};

export const useFetchAppTasks = (id: number) => {
  const api = useApi(mtaApiRef);
  const { isLoading, error, data, isError, isRefetching, isFetching } =
    useQuery<TaskDashboard[]>({
      queryKey: ['tasks'],
      queryFn: () => api.getTasks(),
      select: tasks =>
        tasks
          .filter(task => {
            return task.application.id === id && task.kind === 'analyzer';
          })
          .reverse(),
      refetchInterval: 10000,
    });
  return {
    tasks: data,
    isFetching: isFetching,
    fetchError: error,
    isError: isError,
  };
};
