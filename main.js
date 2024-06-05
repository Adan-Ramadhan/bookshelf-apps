  // create a localStorage
  const STORAGE_KEY = "BOOKS_APPS";
  // create a custom event
  const RENDER_EVENT = "render-book";
  const SAVE_EVENT = "save-book";
  const books = [];

  function isStorageExist() {
    if (typeof (Storage) === undefined) {
      alert("Browser kamu tidak mendukung local storage");
      return false;
    }
    return true;
  }

  function generateId() {
    return +new Date();
  };

  function generateBookObject(id, title, author, year, isComplete) {
    return {
      id,
      title,
      author,
      year,
      isComplete
    };
  }

  function findBook(bookId) {
    for (const bookItem of books) {
      if (bookItem.id === bookId) {
        return bookItem;
      }
    }
    return null;
  }


  function findBookIndex(bookId) {
    for (const index in books) {
      if (books[index].id === bookId) {
        return index;
      }
    }
    return -1;
  }



  function addBooks() {
    const inputBookTitle = document.getElementById('inputBookTitle').value;
    const inputBookAuthor = document.getElementById('inputBookAuthor').value;
    const inputBookYear = document.getElementById('inputBookYear').value;
    const inputBookIsComplete = document.getElementById("inputBookIsComplete").checked;
    const bookYear = parseInt(inputBookYear);
    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, inputBookTitle, inputBookAuthor, bookYear, inputBookIsComplete);
    books.push(bookObject);
    saveData();
  }


  function makeBook(bookObject) {
    const {
      id,
      title,
      author,
      year,
      isComplete
    } = bookObject;

    /* create content for data book in "belum selesai dibaca" */

    const textTitle = document.createElement("h3");
    textTitle.innerText = title;
    const textAuthor = document.createElement("p");
    textAuthor.innerText = `Penulis: ${author}`;
    const textYear = document.createElement("p");
    textYear.innerText = `Tahun: ${year}`;

    /* create container for contain book in "belum selesai dibaca" */
    const mainContainer = document.createElement("article");
    mainContainer.setAttribute("id", `book-${id}`);
    mainContainer.classList.add("book_item");


    // create div for contain button remove and add
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("action");

    mainContainer.append(textTitle, textAuthor, textYear, buttonContainer);

    if (isComplete) {
      const undoButton = document.createElement("button");
      undoButton.classList.add("green");
      undoButton.innerText = "Belum Selesai Dibaca";
      undoButton.addEventListener("click", function () {
        undoTaskFromCompleted(id);
      })


      const removeButton = document.createElement("button");
      removeButton.innerText = "Hapus Buku";
      removeButton.classList.add("red");
      removeButton.addEventListener("click", function () {
        confirmationRemoveTesk(id)
      });

      buttonContainer.append(undoButton, removeButton);

    } else {
      const completeButton = document.createElement("button");
      completeButton.innerText = " Selesai Dibaca";
      completeButton.classList.add("green");
      completeButton.addEventListener("click", function () {
        addTaskToCompleted(id)
      });

      const removeButton = document.createElement("button");
      removeButton.innerText = "Hapus Buku";
      removeButton.classList.add("red");
      removeButton.addEventListener("click", function () {
        confirmationRemoveTesk(id)
      });

      buttonContainer.append(completeButton, removeButton);

    }

    return mainContainer;
  };


  function addTaskToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function confirmationRemoveTesk(bookId) {
    Swal.fire({
      title: "Yakin ingin hapus buku ini?",
      text: "Buku yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        removeTask(bookId)
        Swal.fire({
          title: "Deleted!",
          text: "Buku telah dihapus.",
          icon: "success"
        });
      }
    });

  }

  function removeTask(bookId) {
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) {
      return;
    }
    books.splice(bookTarget, 1);


    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function undoTaskFromCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isComplete = false;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }



  function searchBookByTitle(title) {
    const lowerCaseTitle = title.toLowerCase();
    const filteredBooks = books.filter(book => book.title.toLowerCase().includes(lowerCaseTitle));
    renderingFilterBooks(filteredBooks);
  }

  function renderingFilterBooks(filteredBooks) {
    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
    const completeBookshelfList = document.getElementById("completeBookshelfList");

    incompleteBookshelfList.innerHTML = "";
    completeBookshelfList.innerHTML = "";

    for (const bookItem of filteredBooks) {
      const bookElement = makeBook(bookItem);
      if (bookItem.isComplete) {
        completeBookshelfList.append(bookElement);
      } else {
        incompleteBookshelfList.append(bookElement);
      };
    };
  };


  const searchBook = document.getElementById("searchBook");
  searchBook.addEventListener("submit", function (event) {
    event.preventDefault();
    const searchBookTitle = document.getElementById("searchBookTitle").value;
    searchBookByTitle(searchBookTitle);

  });


  function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVE_EVENT));
    }
  }


  function loadData() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    if (data !== null) {
      for (const book of data) {
        books.push(book);
      }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  document.addEventListener("DOMContentLoaded", function () {
    const submitForm = document.getElementById("inputBook");
    submitForm.addEventListener('submit', function (event) {
      event.preventDefault();
      addBooks();
      document.dispatchEvent(new Event(RENDER_EVENT));
    });
    if (isStorageExist()) {
      loadData();
    }
  });


  document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
    const completeBookshelfList = document.getElementById("completeBookshelfList");

    incompleteBookshelfList.innerHTML = "";
    completeBookshelfList.innerHTML = "";

    for (const bookItem of books) {
      const bookElement = makeBook(bookItem);
      if (bookItem.isComplete) {
        completeBookshelfList.append(bookElement);
      } else {
        incompleteBookshelfList.append(bookElement);
      }
    };

  });