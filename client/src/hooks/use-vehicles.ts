import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Vehicle, InsertVehicle, UpdateVehicleRequest } from "@shared/schema";

export function useVehicles() {
  return useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });
}

export function useCreateVehicle() {
  return useMutation({
    mutationFn: async (data: InsertVehicle) => {
      const res = await apiRequest("POST", "/api/vehicles", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
    },
  });
}

export function useUpdateVehicle() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateVehicleRequest }) => {
      const res = await apiRequest("PUT", `/api/vehicles/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
    },
  });
}

export function useDeleteVehicle() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
    },
  });
}
