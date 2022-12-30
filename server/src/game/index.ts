import { DBConnection } from '../connection/DBCconnection';
import { shuffle } from '../utils/shuffle';

export class Game {
  private dbConnection: DBConnection;

  prompts: string[];

  currentPromptIndex: number;

  constructor(dbConnection: DBConnection) {
    this.prompts = [];
    this.currentPromptIndex = -1;
    this.dbConnection = dbConnection;
  }

  async init() {
    const prompts = await this.dbConnection.getAllPrompts();

    this.prompts = shuffle(prompts);
  }

  start() {
    this.getNewPrompt();
  }

  getNewPrompt() {
    this.currentPromptIndex += 1;
    return this.getCurrentPrompt();
  }

  getCurrentPrompt() {
    return this.prompts[this.currentPromptIndex];
  }

  async onWord(word: string) {
    const wordPromptsList = await this.dbConnection.getPromptsByWord(word);

    if (wordPromptsList.includes(this.getCurrentPrompt())) {
      return true;
    }

    return false;
  }
}
