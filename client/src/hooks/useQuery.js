import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useFetch = (key, fetchFn, options = {}) => {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => {
      const { data } = await fetchFn();
      return data;
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Something went wrong';
      toast.error(message);
    },
    ...options,
  });
};

export const useMutate = (mutationFn, { onSuccess, onError, invalidateKeys } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables) => {
      const { data } = await mutationFn(variables);
      return data;
    },
    onSuccess: (data) => {
      if (data.message) toast.success(data.message);
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
        });
      }
      if (onSuccess) onSuccess(data);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Operation failed';
      toast.error(message);
      if (onError) onError(error);
    },
  });
};
