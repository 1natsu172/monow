import { EOL } from "os";
import { Store } from "redux";
import figures from "figures";
import logUpdate from "log-update";
import terminalLink from "terminal-link";
import stringWidth from "string-width";
import chalk from "chalk";
import { headWordWrap, wordWrap, countLines } from "./lib/ansi";
import { SubState, State } from "./store/state";
import { Action } from "./store/action";
import {
  getPackages,
  getWidth,
  getHeight,
  getError,
  getLogPath,
  getRunningScript
} from "./store/selectors";

type Props = {
  width: number;
  height: number;
  packages: SubState[];
  error: Error | null;
  logPath: string;
  runningScript: string;
};

function renderIndicator({
  indicator,
  ready,
  busy,
  error
}: SubState & { indicator: string }): string {
  if (error) {
    return chalk.red(indicator);
  }
  if (!ready) {
    return chalk.dim(indicator);
  }
  if (busy) {
    return chalk.yellow(indicator);
  }
  return chalk.green(indicator);
}

function renderStatus({
  error,
  busy,
  queued,
  package: pkg,
  runningScript
}: SubState & { runningScript: string }): string {
  if (error) {
    return chalk.red(pkg.name);
  }
  // TODO: ちゃんとステータスが描画されるようにする
  const status = pkg.name;

  if (busy) {
    return chalk.dim(`${pkg.name}: ${runningScript}`);
  }
  if (queued) {
    return `${pkg.name}: ${runningScript} (queued)`;
  }
  return pkg.name;
}

function renderLogPath(error: Error | null, logPath: string): string {
  const link = terminalLink.isSupported
    ? terminalLink(logPath, `file://${logPath}`)
    : logPath;
  return error ? `(saved to ${link})` : "";
}

function renderError({ error }: { error: Error | null }): string {
  return error ? error.message.trim() || "" : "";
}

function renderDivider({
  title,
  width,
  char = "-",
  padChar = " ",
  padding = 1,
  numOfHeadChars = 3
}: {
  title: string;
  width: number;
  char?: string;
  padding?: number;
  padChar?: string;
  numOfHeadChars?: number;
}): string {
  const headChars = char.repeat(numOfHeadChars);
  const padChars = padChar.repeat(padding);
  const headCharsWithTitle = wordWrap(
    headChars + padChars + title + padChars,
    width
  );
  const lastLine = headCharsWithTitle
    .split(EOL)
    .slice(-1)
    .join(EOL);
  const restWidth = width - stringWidth(lastLine);
  const tailChars = char.repeat(restWidth);

  return headCharsWithTitle + tailChars;
}

function renderErrorSummary({
  lines,
  width,
  error,
  logPath
}: {
  width: number;
  lines: number;
  error: Error | null;
  logPath: string;
}): string {
  const _logPath = renderLogPath(error, logPath);
  const divider = renderDivider({ title: `Error: ${_logPath}`, width });
  const separator = EOL + divider + EOL;
  const separatorLines = countLines(separator);
  const log = headWordWrap(
    renderError({ error }),
    width,
    lines - separatorLines
  );

  return error ? separator + chalk.red(log) : "";
}

export function render(props: Props): string {
  const { width, height, packages, error, logPath, runningScript } = props;

  const lines = packages
    .map(subState => ({
      indicator: renderIndicator({
        ...subState,
        indicator: figures.bullet
      }),
      status: renderStatus({ ...subState, runningScript })
    }))
    .map(({ indicator, status }) => {
      return `${indicator} ${status}`;
    })
    .map(line => wordWrap(line, width));

  const linesCount = lines.reduce((acc, line) => acc + countLines(line), 0);
  const restLines = height - linesCount;
  const errorSummaries = renderErrorSummary({
    width,
    lines: restLines,
    error,
    logPath
  });

  return lines.concat(errorSummaries).join(EOL);
}

export const createRenderer = (store: Store<State, Action>) => () => {
  const state = store.getState();

  logUpdate(
    render({
      width: getWidth(state),
      height: getHeight(state),
      packages: getPackages(state),
      error: getError(state),
      logPath: getLogPath(state),
      runningScript: getRunningScript(state)
    })
  );
  // render({
  //   width: getWidth(state),
  //   height: getHeight(state),
  //   packages: getPackages(state),
  //   error: getError(state),
  //   logPath: getLogPath(state)
  // });
};
