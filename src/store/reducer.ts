import { produce, Draft } from "immer";
import { State } from "./state";
import { Action } from "./action";

const initialState: State = {
  size: {
    width: -1,
    height: -1
  },
  packages: {},
  error: null,
  rootDir: "",
  busyPackages: [],
  queuedPackages: [],
  errorPackages: [],
  logPath: "",
  runningScript: ""
};

function reduce(draft: Draft<State>, action: Action) {
  switch (action.type) {
    case "ADD_PACKAGE":
      draft.packages[action.pkg.location] = {
        package: action.pkg,
        ready: false,
        busy: false,
        queued: false,
        error: null
      };
      break;
    case "MAKE_READY":
      draft.packages[action.dir].ready = true;
      break;
    case "RUN_STARTED":
      draft.busyPackages = action.dir;
      draft.queuedPackages = [];
      draft.errorPackages = [];
      draft.error = null;
      for (const dir of action.dir) {
        draft.packages[dir].busy = true;
        draft.packages[dir].queued = false;
        draft.packages[dir].error = null;
      }
      break;
    case "RUN_COMPLETED":
      draft.busyPackages = [];
      for (const dir of action.dir) {
        draft.packages[dir].busy = false;
      }
      break;
    case "RUN_QUEUED":
      draft.queuedPackages = action.dir;
      for (const dir of action.dir) {
        draft.packages[dir].queued = true;
      }
      break;
    case "RUN_ERROR":
      draft.error = action.error;
      draft.errorPackages = action.dir;
      for (const dir of action.dir) {
        draft.packages[dir].error = action.error;
      }
      break;
    case "RUN_CHILD_TASK":
      draft.runningScript = action.scriptName;
      break;
    case "RESIZED": {
      draft.size.width = action.width;
      draft.size.height = action.height;
      break;
    }
  }
  return draft;
}

export function reducer(state: State = initialState, action: Action): State {
  return produce(state, draft => reduce(draft, action));
}
