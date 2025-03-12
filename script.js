let isAddModal = true;
let indexEdit = 0;
let selectedSortBy = 'newFirst';

// Клас для моделювання витрат
class Expense {
  constructor(amount, category, date, title) {
    this.amount = amount;
    this.category = category;
    this.date = date;
    this.title = title;
  }
}

// Клас для управління витратами
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
    switch (sortBy) {
      case 'newFirst':
        return expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'oldFirst':
        return expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'expensiveFirst':
        return expenses.sort((a, b) => b.amount - a.amount);
      default:
        return expenses;
    }
  }

  filterExpenses(queryTitle, isOnlyTodays, category) {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format

    // First, filter by queryTitle, category, and date
    const filteredExpenses = this.expenses.filter((expense) => {
      const matchesTitle = expense.title
        .toLowerCase()
        .includes(queryTitle.toLowerCase());
      const matchesCategory =
        category === 'Всі категорії' || expense.category === category;
      const matchesDate = isOnlyTodays ? expense.date === today : true;

      return matchesTitle && matchesCategory && matchesDate;
    });

    // Then, sort the filtered expenses
    return this.sortExpenses(selectedSortBy, filteredExpenses);
  }

  getTotalExpenses() {
    return this.expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  renderExpenses(expenses) {
    const expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = ''; // Clear the current list of expenses

    expenses.forEach((expense, index) => {
      // Create a list item (li) with the class 'expense-item'
      const li = document.createElement('li');
      li.classList.add('expense-item');

      // Add the details of the expense
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

      // Get the delete and edit buttons
      const deleteButton = li.querySelector('.btn-delete');
      const editButton = li.querySelector('.btn-edit');

      // Add event listener for delete button
      deleteButton.addEventListener('click', () => this.deleteExpense(index));

      // Add event listener for edit button
      editButton.addEventListener('click', () => {
        document.getElementById('add-modal').classList.remove('modal-close');
        document.getElementById('add-modal').classList.add('modal-open');

        indexEdit = index;
        isAddModal = false;

        document.getElementById('amount').value = expense.amount;
        document.getElementById('category').value = expense.category;
        document.getElementById('date').value = expense.date;
        document.getElementById('title').value = expense.title;

        document.getElementById('form-submit').textContent = 'Оновити витрату';
      });

      // Append the list item to the expense list
      expenseList.appendChild(li);
    });

    // Update the total expenses text
    const totalExpensesElement = document.getElementById('total-expenses');
    totalExpensesElement.textContent = `Загальна сума витрат: ${this.getTotalExpenses()} грн`;
  }
}

// Ініціалізація ExpenseManager
const expenseManager = new ExpenseManager();

// Форма для додавання витрат
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
  } // Очищення форми
  expenseForm.reset();
});

const expenseFormCancelBtn = document.getElementById('form-cancel');
expenseFormCancelBtn.addEventListener('click', function () {
  document.getElementById('add-modal').classList.remove('modal-open');
  document.getElementById('add-modal').classList.add('modal-close');

  // Очищення форми
  expenseForm.reset();
});

// Pошук витрат
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', updateExpenses);

const categoryFilter = document.getElementById('category-filter');
categoryFilter.addEventListener('change', updateExpenses);

const dateFilter = document.getElementById('date-filter');
dateFilter.addEventListener('change', updateExpenses);

function updateExpenses() {
  const queryTitle = searchInput.value;
  const isOnlyTodays = dateFilter.checked;
  const category = categoryFilter.value;

  // Get the filtered and sorted expenses
  const filteredAndSortedExpenses = expenseManager.filterExpenses(
    queryTitle,
    isOnlyTodays,
    category
  );

  // Update the DOM with filtered and sorted expenses
  expenseManager.renderExpenses(filteredAndSortedExpenses);
}

// Adding event listeners for sorting buttons
document.getElementById('sort-new').addEventListener('click', function () {
  selectedSortBy = 'newFirst';
  updateSortingButtons();
  updateExpenses(); // Re-render with the new sort order
});

document.getElementById('sort-old').addEventListener('click', function () {
  selectedSortBy = 'oldFirst';
  updateSortingButtons();
  updateExpenses(); // Re-render with the new sort order
});

document
  .getElementById('sort-expensive')
  .addEventListener('click', function () {
    selectedSortBy = 'expensiveFirst';
    updateSortingButtons();
    updateExpenses(); // Re-render with the new sort order
  });

// Helper function to update the visual state of sorting buttons
function updateSortingButtons() {
  document
    .getElementById('sort-new')
    .classList.toggle('sorting-btn-active', selectedSortBy === 'newFirst');
  document
    .getElementById('sort-old')
    .classList.toggle('sorting-btn-active', selectedSortBy === 'oldFirst');
  document
    .getElementById('sort-expensive')
    .classList.toggle(
      'sorting-btn-active',
      selectedSortBy === 'expensiveFirst'
    );
}

// Display expenses when the page loads
window.addEventListener('load', () => updateExpenses()); // Calls updateExpenses on page load to render filtered and sorted expenses

// Add Expense Button
const addExpenseBtn = document.getElementById('logo-btn');
addExpenseBtn.addEventListener('click', () => {
  isAddModal = true;
  document.getElementById('form-submit').textContent = 'Додати витрату';
  document.getElementById('add-modal').classList.remove('modal-close');
  document.getElementById('add-modal').classList.add('modal-open');
});
