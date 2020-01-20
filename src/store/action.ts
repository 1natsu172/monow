import { Package } from "./state";

export const addPackage = (pkg: Package) => ({
  type: "ADD_PACKAGE" as const,
  pkg
});

export const makeReady = (dir: string) => ({
  type: "MAKE_READY" as const,
  dir
});

export const requestRun = (dir: string[]) => ({
  type: "RUN_REQUESTED" as const,
  dir
});

export const startRun = (dir: string[]) => ({
  type: "RUN_STARTED" as const,
  dir
});

export const completeRun = (dir: string[]) => ({
  type: "RUN_COMPLETED" as const,
  dir
});

export const enqueueRun = (dir: string[]) => ({
  type: "RUN_QUEUED" as const,
  dir
});

export const errorRun = (dir: string[], error: Error) => ({
  type: "RUN_ERROR" as const,
  dir,
  error
});

export const childTaskRun = (scriptName: string) => ({
  type: "RUN_CHILD_TASK" as const,
  scriptName
});

export const setSize = ({
  width,
  height
}: {
  width: number;
  height: number;
}) => ({
  type: "RESIZED" as const,
  width,
  height
});

export type Action =
  | ReturnType<typeof addPackage>
  | ReturnType<typeof makeReady>
  | ReturnType<typeof requestRun>
  | ReturnType<typeof startRun>
  | ReturnType<typeof completeRun>
  | ReturnType<typeof enqueueRun>
  | ReturnType<typeof errorRun>
  | ReturnType<typeof childTaskRun>
  | ReturnType<typeof setSize>;
