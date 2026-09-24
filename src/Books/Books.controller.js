import { makeAutoObservable, runInAction } from "mobx";
import booksRepository from "./Books.repository";

export class BooksController {
  books = [];
  isLoading = false;
  name = "";
  author = "";

  constructor(repository = booksRepository) {
    this.repository = repository;
    makeAutoObservable(this, { repository: false });
  }

  get bookLines() {
    return this.books.map((book) => `${book.author}: ${book.name}`);
  }

  get canAdd() {
    return Boolean(this.name.trim() && this.author.trim());
  }

  setName = (name) => {
    this.name = name;
  };

  setAuthor = (author) => {
    this.author = author;
  };

  load = async () => {
    this.isLoading = true;
    try {
      const books = await this.repository.getBooks();
      runInAction(() => {
        this.books = books;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  addBook = async () => {
    if (!this.canAdd) return;

    const isAdded = await this.repository.addBook({
      name: this.name,
      author: this.author
    });
    if (!isAdded) return;

    runInAction(() => {
      this.name = "";
      this.author = "";
    });
    await this.load();
  };
}
