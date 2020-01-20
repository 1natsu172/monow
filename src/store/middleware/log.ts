import fs from "fs";
import { Middleware } from "redux";
import { State } from "../state";
import { Action } from "../action";
import { getError, getLogPath } from "../../store/selectors";

export const createMiddleware = (): Middleware<{}, State> => store => next => (
  action: Action
) => {
  switch (action.type) {
    case "RUN_COMPLETED": {
      const nextAction = next(action);
      const logPath = getLogPath(store.getState());
      const error = getError(store.getState());
      fs.writeFileSync(logPath, error ? error.message : "");

      return nextAction;
    }
  }

  return next(action);
};
