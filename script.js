let all_transaction = [];


let prevBalance = 0, prevIncome = 0, prevExpense = 0;

const transaction_form = document.getElementById("transactionForm");
const transaction_list = document.getElementById("transactionList");
const total_balance    = document.getElementById("totalBalance");
const total_income     = document.getElementById("totalIncome");
const total_expense    = document.getElementById("totalExpense");
const modalOverlay     = document.getElementById("modalOverlay");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn  = document.getElementById("cancelDelete");


let pendingDeleteItem = null;


const saved = localStorage.getItem("transactions");
if (saved) {
  all_transaction = JSON.parse(saved);
  all_transaction.forEach(t => updateList(t.type, t.amount, t.date, t.category));
  updateBalance(false); 
}


function animateValue(element, start, end, prefix = "$") {
  const duration = 500;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1); 

   
    const ease = 1 - Math.pow(1 - progress, 4);
    const current = start + (end - start) * ease;

    element.innerText = prefix + current.toFixed(2);

    if (progress < 1) requestAnimationFrame(step); 
  }

  requestAnimationFrame(step);
}

function updateList(type, amount, date, category) {
  const itemEl    = document.createElement("li");
  const iconEl    = document.createElement("div");
  const detailsEl = document.createElement("div");
  const nameEl    = document.createElement("div");
  const dateEl    = document.createElement("div");
  const amountEl  = document.createElement("div");
  const deleteEl  = document.createElement("button");

  itemEl.classList.add("transaction-item");
  iconEl.classList.add("transaction-icon");
  detailsEl.classList.add("transaction-details");
  nameEl.classList.add("transaction-name");
  dateEl.classList.add("transaction-date");
  amountEl.classList.add("transaction-amount");

  iconEl.innerText = type === "income" ? "↓" : "↑";
  iconEl.classList.add(type === "income" ? "income-icon" : "expense-icon");

  nameEl.innerText = category;
  dateEl.innerText = new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });

  amountEl.innerText = (type === "income" ? "+" : "-") + "$" + parseFloat(amount).toFixed(2);
  amountEl.classList.add(type === "income" ? "income-amount" : "expense-amount");

  deleteEl.innerText = "🗑️";
  deleteEl.addEventListener("click", deleteTransaction);

  detailsEl.appendChild(nameEl);
  detailsEl.appendChild(dateEl);
  itemEl.appendChild(iconEl);
  itemEl.appendChild(detailsEl);
  itemEl.appendChild(amountEl);
  itemEl.appendChild(deleteEl);

  transaction_list.prepend(itemEl);
}


function deleteTransaction(event) {
  pendingDeleteItem = event.currentTarget.closest(".transaction-item");
  modalOverlay.classList.add("active");
}

confirmDeleteBtn.addEventListener("click", () => {
  if (!pendingDeleteItem) return;

  const index = Array.from(transaction_list.children).indexOf(pendingDeleteItem);
  all_transaction.splice(index, 1);


  localStorage.setItem("transactions", JSON.stringify(all_transaction));

  pendingDeleteItem.remove();
  pendingDeleteItem = null;
  modalOverlay.classList.remove("active");
  updateBalance(true);
});

cancelDeleteBtn.addEventListener("click", () => {
  pendingDeleteItem = null;
  modalOverlay.classList.remove("active");
});

function updateBalance(animate = true) {
  let income = 0, expense = 0, balance = 0;

  all_transaction.forEach(t => {
    if (t.type === "income") {
      income  += parseFloat(t.amount);
      balance += parseFloat(t.amount);
    } else {
      expense += parseFloat(t.amount);
      balance -= parseFloat(t.amount);
    }
  });

  if (animate) {

    animateValue(total_balance, prevBalance, balance);
    animateValue(total_income,  prevIncome,  income);
    animateValue(total_expense, prevExpense, expense);
  } else {
    total_balance.innerText = "$" + balance.toFixed(2);
    total_income.innerText  = "$" + income.toFixed(2);
    total_expense.innerText = "$" + expense.toFixed(2);
  }

  prevBalance = balance;
  prevIncome  = income;
  prevExpense = expense;
}

transaction_form.addEventListener("submit", function(event) {
  event.preventDefault();

  const type     = event.target.type.value;
  const amount   = event.target.amount.value;
  const date     = event.target.date.value;
  const category = event.target.category.value;

  updateList(type, amount, date, category);
  all_transaction.unshift({ type, amount, date, category });


  localStorage.setItem("transactions", JSON.stringify(all_transaction));

  updateBalance(true);
  transaction_form.reset();
});