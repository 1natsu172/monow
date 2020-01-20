import sortBy from "lodash.sortby";
import { State } from "./state";

export const getWidth = (state: State) => state.size.width;

export const getHeight = (state: State) => state.size.height;

export const getPackageMap = (state: State) => state.packages;

export const getPackages = (state: State) =>
  sortBy(
    Object.values(getPackageMap(state)),
    subState => subState.package.name
  );

export const getBusyPackages = (state: State) => state.busyPackages;

export const getQueuedPackages = (state: State) => state.queuedPackages;

export const hasBusyPackages = (state: State) => state.busyPackages.length > 0;

export const hasQueuedPackages = (state: State) =>
  state.queuedPackages.length > 0;

export const getErrorPackages = (state: State) => state.errorPackages;

export const getError = (state: State) => state.error;

export const getLogPath = (state: State) => state.logPath;

export const getRunningScript = (state: State) => state.runningScript;
