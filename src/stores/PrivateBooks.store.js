import { makeAutoObservable, runInAction } from "mobx";
import booksRepository from "../Books/Books.repository";

export class PrivateBooksStore {
  privateCount = 0;

  constructor(repository = booksRepository) {
    this.repository = repository;
    makeAutoObservable(this, { repository: false });
  }

  refreshPrivateCount = async () => {
    const books = await this.repository.getPrivateBooks();
    runInAction(() => {
      this.privateCount = books.length;
    });
  };
}

export const privateBooksStore = new PrivateBooksStore();
