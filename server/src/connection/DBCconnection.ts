import { createClient } from 'redis';

export class DBConnection {
  private dbClient: ReturnType<typeof createClient>;

  constructor(dbClient: ReturnType<typeof createClient>) {
    this.dbClient = dbClient;
  }

  getPromptsCount() {
    return this.dbClient.sCard('prompts');
  }

  getAllPrompts() {
    return this.dbClient.sMembers('prompts');
  }

  getPromptsByWord(word: string) {
    return this.dbClient.sMembers(`${word}:prompts`);
  }
}
