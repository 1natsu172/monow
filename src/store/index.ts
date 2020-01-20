import { createStore as createReduxStore, applyMiddleware } from "redux";
import { reducer } from "./reducer";
import { State } from "./state";
import { Action } from "./action";
import { Runner } from "../runner";
import { createMiddleware as createRunMiddleware } from "./middleware/run";
import { createMiddleware as createLogMiddleware } from "./middleware/log";
import { createMiddleware as createResizeMiddleware } from "./middleware/resize";
import { createMiddleware as createNotifyMiddleware } from "./middleware/notify";

export function createStore(
  initialState: State,
  {
    runner,
    allowNotify,
    tty
  }: {
    runner: Runner;
    allowNotify: boolean;
    tty: typeof process.stdout;
  }
) {
  const middlewares = [
    createNotifyMiddleware({ allowNotify }),
    createResizeMiddleware(tty),
    createRunMiddleware(runner),
    createLogMiddleware()
  ];

  return createReduxStore<State, Action, {}, {}>(
    reducer,
    initialState,
    applyMiddleware(...middlewares)
  );
}
