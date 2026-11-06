
// Get HTML elements
const transactionForm = document.getElementById("transactionForm");
const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const totalIncomeElement = document.getElementById("totalIncome");
const totalExpensesElement = document.getElementById("totalExpenses");
const currentBalanceElement = document.getElementById("currentBalance");

const transactionTable = document.getElementById("transactionTable");
const filterType = document.getElementById("filterType");
const searchInput = document.getElementById("searchInput");
const emptyMessage = document.getElementById("emptyMessage");

// Load transactions from localStorage
function loadTransactions() {
    try {
        const savedData = localStorage.getItem("transactions");
        const parsedData = savedData ? JSON.parse(savedData) : [];

        return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
        console.error("Unable to load transactions:", error);
        return [];
    }
}

// Store all transactions in an array
let transactions = loadTransactions();

// Format numbers as Sri Lankan Rupees
function formatCurrency(amount) {
    return "LKR " + amount.toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Save transactions to localStorage
function saveTransactions() {
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}

// Set the default transaction date to today
function setDefaultDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    dateInput.value = `${year}-${month}-${day}`;
}

// Calculate and display financial summaries
function updateSummary() {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(function(transaction) {
        if (transaction.type === "Income") {
            totalIncome += transaction.amount;
        } else if (transaction.type === "Expense") {
            totalExpenses += transaction.amount;
        }
    });

    const balance = totalIncome - totalExpenses;

    totalIncomeElement.textContent = formatCurrency(totalIncome);
    totalExpensesElement.textContent = formatCurrency(totalExpenses);
    currentBalanceElement.textContent = formatCurrency(balance);

    // Show a negative balance in red
    currentBalanceElement.classList.toggle(
        "text-danger",
        balance < 0
    );
}

// Display transactions in the table
function displayTransactions() {
    transactionTable.replaceChildren();

    // Apply type filter and search
    const selectedType = filterType.value;
    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredTransactions = transactions.filter(
        function(transaction) {
            const matchesType =
                selectedType === "All" ||
                transaction.type === selectedType;

            const matchesSearch =
                transaction.description.toLowerCase().includes(searchTerm) ||
                transaction.category.toLowerCase().includes(searchTerm);

            return matchesType && matchesSearch;
        }
    );

    // Show a message when there are no matching transactions
    emptyMessage.classList.toggle(
        "d-none",
        filteredTransactions.length > 0
    );

    // Create a table row for each transaction
    filteredTransactions.forEach(function(transaction) {
        const row = document.createElement("tr");

        // Date
        const dateCell = document.createElement("td");
        dateCell.textContent = transaction.date;
        row.appendChild(dateCell);

        // Description
        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = transaction.description;
        row.appendChild(descriptionCell);

        // Transaction type
        const typeCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className = transaction.type === "Income"
            ? "badge text-bg-success"
            : "badge text-bg-danger";

        badge.textContent = transaction.type;
        typeCell.appendChild(badge);
        row.appendChild(typeCell);

        // Category
        const categoryCell = document.createElement("td");
        categoryCell.textContent = transaction.category;
        row.appendChild(categoryCell);

        // Amount
        const amountCell = document.createElement("td");
        amountCell.className = "text-end";

        amountCell.classList.add(
            transaction.type === "Income"
                ? "amount-income"
                : "amount-expense"
        );

        const sign = transaction.type === "Income" ? "+" : "−";

        amountCell.textContent =
            sign + " " + formatCurrency(transaction.amount);

        row.appendChild(amountCell);

        // Delete button
        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "btn btn-sm btn-outline-danger";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            deleteTransaction(transaction.id);
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        transactionTable.appendChild(row);
    });
}

// Add a new transaction
transactionForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const type = typeInput.value;
    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    // Validate the inputs
    if (
        description === "" ||
        category === "" ||
        date === "" ||
        !["Income", "Expense"].includes(type) ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        alert("Please enter valid transaction details.");
        return;
    }

    // Create a transaction object
    const transaction = {
        id: crypto.randomUUID(),
        type: type,
        description: description,
        amount: amount,
        category: category,
        date: date
    };

    // Add the object to the array
    transactions.push(transaction);

    // Save and refresh the interface
    saveTransactions();
    updateSummary();
    displayTransactions();

    // Reset the form
    transactionForm.reset();
    setDefaultDate();

    alert("Transaction added successfully!");
});

// Delete a transaction
function deleteTransaction(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) {
        return;
    }

    transactions = transactions.filter(function(transaction) {
        return transaction.id !== id;
    });

    saveTransactions();
    updateSummary();
    displayTransactions();
}

// Filter transactions by type
filterType.addEventListener("change", displayTransactions);

// Search by description or category
searchInput.addEventListener("input", displayTransactions);

// Set the date when the user clears the form
transactionForm.addEventListener("reset", function() {
    setTimeout(setDefaultDate, 0);
});

// Initialise the application
setDefaultDate();
updateSummary();
displayTransactions();
