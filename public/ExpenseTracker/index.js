
const token = localStorage.getItem('token');

let currentPage = 1;
const itemsPerPage = calcaluteItemsPerpage();
function addNewExpense(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const expenseDetails = {
        expenseamount: form.get("expenseamount"),
        description: form.get("description"),
        category: form.get("category")
    };
    axios.post('http://54.79.191.141:3000/user/addexpense', expenseDetails, { headers: {"Authorization": token} }).then((response) => {
        if (response.status === 201) {
            loadExpenses(currentPage); // Reload current page
        } else {
            throw new Error('Failed To create new expense');
        }
    }).catch(err => showError(err));
}

function calcaluteItemsPerpage(){
    const screenWidth = window.innerWidth;
    if(screenWidth<600){
        return 5;
    }else if(screenWidth<1200){
        return 10
    }else{
        return 20;
    }
}

window.addEventListener('load', () => {
    loadExpenses(currentPage);
});

window.addEventListener('resize', () => {
    itemsPerPage = calcaluteItemsPerpage();
    loadExpenses(currentPage)
})

function loadExpenses(page) {
    axios.get(`http://54.79.191.141:3000/user/getexpenses?page=${page}&limit=${itemsPerPage}`, { headers: {"Authorization": token} }).then(response => {
        if (response.status === 200) {
            const expenses = response.data.expenses;
            const totalItems = response.data.totalItems;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            renderExpenses(expenses);
            updatePaginationInfo(page, totalPages);
        } else {
            throw new Error();
        }
    }).catch(err => showError(err));
}

function renderExpenses(expenses) {
    const parentElement = document.getElementById('listOfExpenses');
    parentElement.innerHTML = '';
    expenses.forEach(expense => {
        const expenseElemId = `expense-${expense.id}`;
        parentElement.innerHTML += `
            <li id=${expenseElemId}>
                ${expense.expenseamount} - ${expense.category} - ${expense.description}
                <button onclick='deleteExpense(event, ${expense.id})'>Delete Expense</button>
            </li>`;
    });
}


function updatePaginationInfo(page, totalPages) {
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Page ${page} of ${totalPages}`;
    document.getElementById('prevPage').disabled = page <= 1;
    document.getElementById('nextPage').disabled = page >= totalPages;
}

function changePage(direction) {
    currentPage += direction;
    loadExpenses(currentPage);
}

function deleteExpense(e, expenseid) {
    axios.delete(`http://54.79.191.141:3000/user/deleteexpense/${expenseid}`, { headers: {"Authorization": token} }).then((response) => {
        if (response.status === 204) {
            loadExpenses(currentPage); // Reload current page
        } else {
            throw new Error('Failed to delete');
        }
    }).catch((err => {
        showError(err);
    }));
}

function showError(err) {
    document.body.innerHTML += `<div style="color:red;"> ${err}</div>`;
}

// Razorpay integration remains unchanged
document.getElementById('rzp-button1').onclick = async function (e) {
    const response = await axios.get('http://54.79.191.141:3000/purchase/premiummembership', { headers: {"Authorization": token} });
    var options = {
        "key": response.data.key_id,
        "name": "Test Company",
        "order_id": response.data.order.id,
        "prefill": {
            "name": "Test User",
            "email": "test.user@example.com",
            "contact": "7003442036"
        },
        "theme": {
            "color": "#3399cc"
        },
        "handler": function (response) {
            axios.post('http://54.79.191.141:3000/purchase/updatetransactionstatus', {
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id,
            }, { headers: {"Authorization": token} }).then(() => {
                alert('You are a Premium User Now');
            }).catch(() => {
                alert('Something went wrong. Try Again!!!');
            });
        }
    };
    const rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();
    rzp1.on('payment.failed', function (response) {
        alert(response.error.code);
        alert(response.error.description);
        alert(response.error.source);
        alert(response.error.step);
        alert(response.error.reason);
        alert(response.error.metadata.order_id);
        alert(response.error.metadata.payment_id);
    });
};
