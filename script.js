let isAddModal = true;
let indexEdit = 0;
let selectedSortBy = 'newFirst';

class Expense {
  constructor(amount, category, date, title) {
    this.amount = amount;
    this.category = category;
    this.date = date;
    this.title = title;
  }
}

class ExpenseManager {
  constructor() {
    this.expenses = this.loadExpenses();
  }

  loadExpenses() {
    const storedExpenses = localStorage.getItem('expenses');
    return storedExpenses ? JSON.parse(storedExpenses) : [];
  }

  saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(this.expenses));
  }

  addExpense(expense) {
    this.expenses.push(expense);
    this.saveExpenses();
    this.renderExpenses(this.expenses);
  }

  editExpense(expense, index) {
    this.expenses[index] = expense;
    this.saveExpenses();
    this.renderExpenses(this.expenses);
  }

  deleteExpense(index) {
    this.expenses.splice(index, 1);
    this.saveExpenses();
    this.renderExpenses(this.expenses);
  }

  sortExpenses(sortBy, expenses) {
    const sortFunctions = {
      newFirst: (a, b) => new Date(b.date) - new Date(a.date),
      oldFirst: (a, b) => new Date(a.date) - new Date(b.date),
      expensiveFirst: (a, b) => b.amount - a.amount,
    };
    return expenses.sort(sortFunctions[sortBy] || sortFunctions.newFirst);
  }

  filterExpenses(queryTitle, isOnlyTodays, category) {
    const today = new Date().toISOString().split('T')[0];
    const filteredExpenses = this.expenses.filter((expense) => {
      const matchesTitle = expense.title
        .toLowerCase()
        .includes(queryTitle.toLowerCase());
      const matchesCategory =
        category === 'Всі категорії' || expense.category === category;
      const matchesDate = isOnlyTodays ? expense.date === today : true;
      return matchesTitle && matchesCategory && matchesDate;
    });

    return this.sortExpenses(selectedSortBy, filteredExpenses);
  }

  getTotalExpenses() {
    return this.expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  renderExpenses(expenses) {
    const expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = '';
    expenses.forEach((expense, index) => {
      const li = document.createElement('li');
      li.classList.add('expense-item');
      li.innerHTML = `
        <div class="expense-details">
          <i class="expense-date">${expense.date}</i>
          <h4 class="expense-title">${expense.title}</h4>
          <p class="expense-category">${expense.category}</p>
          <b class="expense-amount">${expense.amount} грн</b>
        </div>
        <div class="expense-actions">
          <button class="btn-delete">✖</button>
          <button class="btn-edit">✎</button>
        </div>
      `;

      li.querySelector('.btn-delete').addEventListener('click', () =>
        this.deleteExpense(index)
      );
      li.querySelector('.btn-edit').addEventListener('click', () =>
        this.editExpenseModal(expense, index)
      );

      expenseList.appendChild(li);
    });

    document.getElementById(
      'total-expenses'
    ).textContent = `Загальна сума витрат: ${this.getTotalExpenses()} грн`;
  }

  editExpenseModal(expense, index) {
    document.getElementById('add-modal').classList.remove('modal-close');
    document.getElementById('add-modal').classList.add('modal-open');
    indexEdit = index;
    isAddModal = false;

    document.getElementById('amount').value = expense.amount;
    document.getElementById('category').value = expense.category;
    document.getElementById('date').value = expense.date;
    document.getElementById('title').value = expense.title;
    document.getElementById('form-submit').textContent = 'Оновити витрату';
  }
}

const expenseManager = new ExpenseManager();

const expenseForm = document.getElementById('expense-form');
expenseForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;
  const title = document.getElementById('title').value;

  if (!amount || !category || !date || !title) {
    alert('Будь ласка, заповніть всі поля.');
    return;
  }

  const expense = new Expense(amount, category, date, title);

  if (isAddModal) {
    expenseManager.addExpense(expense);
  } else {
    expenseManager.editExpense(expense, indexEdit);
    document.getElementById('add-modal').classList.remove('modal-open');
    document.getElementById('add-modal').classList.add('modal-close');
  }

  expenseForm.reset();
});

const expenseFormCancelBtn = document.getElementById('form-cancel');
expenseFormCancelBtn.addEventListener('click', function () {
  document.getElementById('add-modal').classList.remove('modal-open');
  document.getElementById('add-modal').classList.add('modal-close');
  expenseForm.reset();
});

const searchInput = document.getElementById('search');
const categoryFilter = document.getElementById('category-filter');
const dateFilter = document.getElementById('date-filter');
searchInput.addEventListener('input', updateExpenses);
categoryFilter.addEventListener('change', updateExpenses);
dateFilter.addEventListener('change', updateExpenses);

function updateExpenses() {
  const queryTitle = searchInput.value;
  const isOnlyTodays = dateFilter.checked;
  const category = categoryFilter.value;

  const filteredAndSortedExpenses = expenseManager.filterExpenses(
    queryTitle,
    isOnlyTodays,
    category
  );
  expenseManager.renderExpenses(filteredAndSortedExpenses);
}

const sortingButtons = {
  'sort-new': 'newFirst',
  'sort-old': 'oldFirst',
  'sort-expensive': 'expensiveFirst',
};

Object.entries(sortingButtons).forEach(([buttonId, sortType]) => {
  document.getElementById(buttonId).addEventListener('click', () => {
    selectedSortBy = sortType;
    updateSortingButtons();
    updateExpenses();
  });
});

function updateSortingButtons() {
  Object.keys(sortingButtons).forEach((buttonId) => {
    document
      .getElementById(buttonId)
      .classList.toggle(
        'sorting-btn-active',
        sortingButtons[buttonId] === selectedSortBy
      );
  });
}

window.addEventListener('load', updateExpenses);

const addExpenseBtn = document.getElementById('logo-btn');
addExpenseBtn.addEventListener('click', () => {
  isAddModal = true;
  document.getElementById('form-submit').textContent = 'Додати витрату';
  document.getElementById('add-modal').classList.remove('modal-close');
  document.getElementById('add-modal').classList.add('modal-open');
});
