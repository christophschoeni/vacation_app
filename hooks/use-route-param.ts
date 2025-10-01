import { useLocalSearchParams } from 'expo-router';

/**
 * Custom hook to extract a single route parameter safely
 * Handles both single values and arrays from useLocalSearchParams
 *
 * @param paramName - The name of the route parameter to extract
 * @returns The parameter value as a string
 */
export function useRouteParam(paramName: string): string {
  const params = useLocalSearchParams();
  const param = params[paramName];

  return Array.isArray(param) ? param[0] : param;
}

/**
 * Convenience hook for extracting the 'id' parameter specifically
 * This is the most common use case in the app
 *
 * @returns The id parameter as a string
 */
export function useRouteId(): string {
  return useRouteParam('id');
}