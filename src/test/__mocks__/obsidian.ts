export class Vault {
  getConfig(_key: string): string | null {
    return null;
  }
}

export class App {
  vault: Vault;
  constructor() {
    this.vault = new Vault();
  }
}

export class Plugin {
  async loadData(): Promise<any> {
    return null;
  }
}
