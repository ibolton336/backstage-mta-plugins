import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Application, Identity, mtaApiRef, Target } from '../api/api';
import { useApi } from '@backstage/core-plugin-api';

export const TargetsQueryKey = 'targets';

export const useUpdateApplication = () => {
  const api = useApi(mtaApiRef);
  const queryClient = useQueryClient();

  const updateApplication = async (application: Application) => {
    return await api.updateApplication(application);
  };

  const mutation = useMutation<any, Error, any>({
    mutationFn: updateApplication,
    onSuccess: () => {
      queryClient.invalidateQueries();
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
      if (data instanceof URL) {
        window.location.href = data.toString(); // handle redirection
      }
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
