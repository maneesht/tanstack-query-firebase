import {
  type InitialDataFunction,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
import deepEqual from "deep-equal";
import type { FirebaseError } from "firebase/app";
import {
  type CallerSdkType,
  CallerSdkTypeEnum,
  type QueryRef,
  type QueryResult,
  executeQuery,
} from "firebase/data-connect";
import { useEffect, useMemo, useState } from "react";
import type { PartialBy } from "../../utils";
import type {
  QueryResultRequiredRef,
  UseDataConnectQueryResult,
} from "./types";

export type useDataConnectQueryOptions<
  TData = object,
  TError = FirebaseError,
> = PartialBy<Omit<UseQueryOptions<TData, TError>, "queryFn">, "queryKey">;
function getRef<Data, Variables>(
  refOrResult: QueryRef<Data, Variables> | QueryResult<Data, Variables>,
): QueryRef<Data, Variables> {
  return "ref" in refOrResult ? refOrResult.ref : refOrResult;
}

export function useDataConnectQuery<Data = unknown, Variables = unknown>(
  refOrResult: QueryRef<Data, Variables> | QueryResult<Data, Variables>,
  options?: useDataConnectQueryOptions<Data, FirebaseError>,
  _callerSdkType: CallerSdkType = CallerSdkTypeEnum.TanstackReactCore,
): UseDataConnectQueryResult<Data, Variables> {
  const [dataConnectResult, setDataConnectResult] = useState<
    QueryResultRequiredRef<Data, Variables>
  >("ref" in refOrResult ? refOrResult : { ref: refOrResult });
  const [ref, setRef] = useState(dataConnectResult.ref);
  // TODO(mtewani): in the future we should allow for users to pass in `QueryResult` objects into `initialData`.
  const [initialData] = useState(
    dataConnectResult.data || options?.initialData,
  );

  useEffect(() => {
    setRef((oldRef) => {
      const newRef = getRef(refOrResult);
      if (
        newRef.name !== oldRef.name ||
        !deepEqual(oldRef, newRef, { strict: true })
      ) {
        return newRef;
      }
      return oldRef;
    });
  }, [refOrResult]);

  // @ts-expect-error function is hidden under `DataConnect`.
  ref.dataConnect._setCallerSdkType(_callerSdkType);
  const useQueryResult = useQuery<Data, FirebaseError>({
    ...options,
    initialData,
    queryKey: options?.queryKey ?? [ref.name, ref.variables || null],
    queryFn: async () => {
      const response = await executeQuery<Data, Variables>(ref);
      setDataConnectResult(response);
      return {
        ...response.data,
      };
    },
  });
  return {
    ...useQueryResult,
    dataConnectResult,
  };
}
