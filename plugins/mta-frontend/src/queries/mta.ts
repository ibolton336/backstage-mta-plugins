import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mtaApiRef, Target } from '../api/api';
import { useApi } from '@backstage/core-plugin-api';

export const TargetsQueryKey = 'targets';

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
