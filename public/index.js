const url = location.hostname === '' ? "https://cusco-api.vercel.app/api" : "/api";

async function getRecords() {
    const response = await fetch(url);
    const records = await response.json();

    return records;
}
const records = getRecords();

function createRow(record) {
    const row = document.createElement("tr");

    const name = document.createElement("td");
    name.innerText = record.customer;

    const date = document.createElement("td");
    date.innerText = formatDate(new Date(record.date));
    date.classList.add("date-column");

    const subject = document.createElement("td");
    subject.innerText = record.subject;

    const price = document.createElement("td");
    price.innerText = `$${record.price}`;

    const actions = document.createElement("td");

    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<i class="fa-solid fa-trash" style="color: #353536;"></i>';
    deleteButton.classList.add("delete-button");
    deleteButton.onclick = createOnClick(record.id, row, deleteButton);

    const editLink = document.createElement("a");
    editLink.innerHTML = '<i class="fa-solid fa-pen" style="color: #4c4c4d;"></i>';
    editLink.href = `new-edit.html?id=${record.id}`

    actions.append(editLink, deleteButton);

    row.append(name, date, subject, price, actions);

    return row;
}

function createOnClick(id, row, button) {
    return async function () {
        if (!confirm("Are you sure that you want to delete the item?")) {
            return;
        }

        button.disabled = true;
        const response = await fetch(`${url}/${id}`, {
            method: "DELETE"
        })

        if (response.ok) {
            const list = document.getElementById("list");
            list.removeChild(row);
        } else {
            button.disabled = false;
            alert("Error");
        }
    }
}

async function printList(search) {
    const list = document.getElementById("list");
    list.innerHTML = "";

    for (const record of (await records)) {
        if (!search || search.length === 0 || hasSearchInRecord(record, search)) {
            list.append(createRow(record));
        }
    }
}

//debounce 
let searchTimeOutId;
function onSearchKeyUp(event) {
    if (searchTimeOutId) {
        clearTimeout(searchTimeOutId);
        searchTimeOutId = undefined;
    }

    searchTimeOutId = setTimeout(async () => {
        const search = event.target.value.toLowerCase();
        console.log('searching', search);
        printList(search);
    }, 400);
}

function hasSearchInRecord(record, search) {
    for (const item of Object.values(record)) {
        if (item.toString().toLowerCase().includes(search)) {
            return true;
        }
    }
}

window.onpageshow = async function () {
    const search = document.getElementById("search-bar").value;
    console.log("search.val:", search);
    printList(search.toLowerCase());
}