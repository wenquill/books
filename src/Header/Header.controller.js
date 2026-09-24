import { makeAutoObservable } from "mobx";
import { privateBooksStore } from "../stores/PrivateBooks.store";

export class HeaderController {
  constructor(store = privateBooksStore) {
    this.store = store;
    makeAutoObservable(this, { store: false });
  }

  get counterText() {
    return `Your books: ${this.store.privateCount}`;
  }

  load = () => this.store.refreshPrivateCount();
}
