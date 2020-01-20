// import { PackageGraphNode } from "@lerna/package-graph";

export type Package = {
  name: string;
  location: string;
  localDependents: Map<string, Package>;
};

export type SubState = {
  ready: boolean;
  queued: boolean;
  busy: boolean;
  package: Package;
  error: Error | null;
};

export type State = {
  size: {
    width: number;
    height: number;
  };
  packages: {
    [dir: string]: SubState;
  };
  rootDir: string;
  logPath: string;
  runningScript: string;
  error: Error | null;
  busyPackages: string[];
  queuedPackages: string[];
  errorPackages: string[];
};
