import path from "path";
import execa from "execa";

type Options = {
  scriptName: string;
};

export class Tester {
  scriptName: string;

  constructor(options: Options) {
    this.scriptName = options.scriptName;
  }

  async test(cwd: string): Promise<void> {
    if (!(await this.shouldRun(cwd))) {
      return;
    }
    try {
      await execa("npm", ["run", this.scriptName], {
        cwd
      });
    } catch (e) {
      throw new Error(`[exitCode:${e.exitCode}] ${e.stderr}`);
    }
  }

  private async shouldRun(cwd: string) {
    const pkg = require(path.join(cwd, "package.json"));
    return pkg.scripts && !!pkg.scripts[this.scriptName];
  }
}
