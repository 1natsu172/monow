import { FSWatcher } from "fs";
import tmp from "tmp";
import { createStore } from "../store";
import { getPackages } from "../store/selectors";
import { State } from "../store/state";
import { watch } from "../watcher";
import { createRenderer } from "../renderer";
import { getIgnore } from "../lib/gitignore";
import { getRootDir, getLernaPackages } from "../lib/lerna";
import { reducer } from "../store/reducer";
import * as actions from "../store/action";
import { Runner } from "../runner";

type Options = {
  buildScript: string;
  testScript: string;
  runTests: boolean;
  allowNotify: boolean;
};

async function getStore(rootDir: string, options: Options) {
  const tty = process.stdout;
  const runner = new Runner({
    scriptNames: [options.buildScript, options.testScript]
  });
  const lernaPackages = await getLernaPackages(rootDir);

  const initialState = lernaPackages.reduce(
    (state: State, pkg) => {
      return reducer(state, actions.addPackage(pkg));
    },
    {
      size: {
        width: tty.columns!,
        height: tty.rows!
      },
      packages: {},
      rootDir,
      runningScript: "",
      error: null,
      busyPackages: [],
      queuedPackages: [],
      errorPackages: [],
      logPath: tmp.fileSync({
        template: `.monow-XXXXXX.log`
      }).name
    }
  );

  return createStore(initialState, {
    runner,
    tty,
    allowNotify: options.allowNotify
  });
}

export async function main(cwd: string, options: Options) {
  const rootDir = getRootDir(cwd);
  if (!rootDir) {
    throw new Error("Cannot find lerna.json");
  }

  tmp.setGracefulCleanup();

  const store = await getStore(rootDir, options);
  store.subscribe(createRenderer(store));

  const packages = getPackages(store.getState());
  if (packages.length === 0) {
    console.log(`package not found in ${rootDir}`);
  }

  const watchers: FSWatcher[] = [];
  process.on("SIGINT", () => {
    watchers.forEach(w => w.close());
  });
  for (const { package: pkg } of packages) {
    const ignore = getIgnore(pkg.location);
    const watcher = watch(pkg.location);
    watchers.push(watcher);
    watcher.on("change", (_, filename: string) => {
      if (ignore.ignores(filename)) {
        return;
      }
      store.dispatch(actions.requestRun([pkg.location]));
    });
    watcher.on("error", (error: Error) => {
      store.dispatch(actions.errorRun([pkg.location], error));
      store.dispatch(actions.completeRun([pkg.location]));
    });
    store.dispatch(actions.makeReady(pkg.location));
  }
}
