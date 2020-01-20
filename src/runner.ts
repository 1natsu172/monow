import execa from "execa";

type Options = {
  scriptNames: string[];
};

export class Runner {
  scriptNames: string[];
  runningChain: ReturnType<Runner["createRunningChain"]>;

  constructor(options: Options) {
    this.scriptNames = options.scriptNames;
    this.runningChain = this.createRunningChain({
      scriptNames: options.scriptNames
    });
  }

  async run({
    cwd,
    args = [],
    dispatcher
  }: {
    cwd: string;
    args?: readonly string[];
    dispatcher: (scriptName: string) => void;
  }): Promise<void> {
    await this.runningChain({ cwd, args, dispatcher });
  }

  async exec({
    cwd,
    scriptName,
    args = [],
    dispatcher
  }: {
    cwd: string;
    scriptName: string;
    args?: readonly string[];
    dispatcher: (scriptName: string) => void;
  }): Promise<void> {
    try {
      dispatcher(scriptName);
      await execa("lerna", ["run", scriptName, ...args], {
        cwd,
        all: true,
        preferLocal: true,
        localDir: cwd
      });
      // TODO: CHILDRUNが終わったらnotifを出すようにactionをdispatchする
    } catch (e) {
      throw new Error(`[exitCode:${e.exitCode}] ${e.all}`);
    }
  }

  /**
   * Create synchronous script execution task.
   * * passed scriptNames must be ordered.
   */
  createRunningChain({
    scriptNames
  }: {
    scriptNames: string[];
  }): (args: {
    cwd: string;
    args?: readonly string[];
    dispatcher: (scriptName: string) => void;
  }) => Promise<void> {
    return ({ cwd, args, dispatcher }) =>
      scriptNames.reduce(
        (chain, scriptName) =>
          chain.then(() => this.exec({ cwd, scriptName, args, dispatcher })),
        Promise.resolve()
      );
  }
}
