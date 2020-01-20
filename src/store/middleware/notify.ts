import notifier from "node-notifier";
import { Middleware } from "redux";
import { State } from "../state";
import { Action } from "../action";

export const createMiddleware = ({
  allowNotify
}: {
  allowNotify: boolean;
}): Middleware<{}, State> => store => {
  return next => (action: Action) => {
    if (!allowNotify) {
      return next(action);
    }

    if (action.type === "RUN_COMPLETED" || action.type === "RUN_ERROR") {
      const { runningScript, error, packages } = store.getState();
      notifier.notify({
        title: error
          ? `${runningScript} failed`
          : `${runningScript} successful`,
        message: action.dir.map(dir => packages[dir].package.name).join(", ")
      });
    }

    return next(action);
  };
};
