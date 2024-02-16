"use client";

import type { BackendSettings } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const queryKey = "backendSettings";
const url = `/api/settings`;

const postData = async (data: BackendSettings) => {
  console.log("postData", data);
  return await fetch(url, { method: "post", body: JSON.stringify(data) });
};

const getData = async (): Promise<BackendSettings> => {
  const resp = await fetch(url);
  const settings: BackendSettings = await resp.json();
  return settings;
};

export const useBackendSettings = () => {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: [queryKey], queryFn: getData });
  const mutation = useMutation({
    mutationFn: postData,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  return { query, mutation };
};
