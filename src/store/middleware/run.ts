import { Middleware } from "redux";
import { State } from "../state";
import {
  Action,
  startRun,
  completeRun,
  enqueueRun,
  requestRun,
  errorRun,
  childTaskRun
} from "../action";
import { Runner } from "../../runner";
import {
  getBusyPackages,
  getQueuedPackages,
  getErrorPackages
} from "../selectors";
import { createScopeArguments } from "../../lib/lerna";

export const createMiddleware = (
  runner: Runner
): Middleware<{}, State> => store => next => (action: Action) => {
  switch (action.type) {
    case "RUN_REQUESTED": {
      const busyPackages = getBusyPackages(store.getState());
      const errorPackages = getErrorPackages(store.getState());
      const runTarget = [
        ...new Set([...action.dir, ...busyPackages, ...errorPackages])
      ];

      if (busyPackages.length > 0) {
        store.dispatch(enqueueRun(runTarget));
        return;
      }

      store.dispatch(startRun(runTarget));

      return next(action);
    }

    case "RUN_STARTED": {
      const { rootDir, packages } = store.getState();

      const args = createScopeArguments(
        action.dir.map(dir => packages[dir].package.name)
      );

      const setRunningScript = (scriptName: string) =>
        store.dispatch(childTaskRun(scriptName));

      runner
        .run({ cwd: rootDir, args, dispatcher: setRunningScript })
        .catch(error => {
          store.dispatch(errorRun(action.dir, error));
        })
        .finally(() => {
          store.dispatch(completeRun(action.dir));
        });

      return next(action);
    }

    case "RUN_COMPLETED": {
      const queuedPackages = getQueuedPackages(store.getState());
      if (queuedPackages.length > 0) {
        const nextAction = next(action);
        store.dispatch(requestRun(queuedPackages));
        return nextAction;
      }
    }
  }

  return next(action);
};
