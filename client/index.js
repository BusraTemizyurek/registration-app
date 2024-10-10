document.documentElement.setAttribute('data-bs-theme', (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    document.documentElement.setAttribute('data-bs-theme', (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
})
const url = "/api";

async function getRecords() {
    const response = await fetch(url);
    const records = await response.json();

    return records;
}
const records = getRecords();

async function getUser() {
    const response = await fetch(`${url}/user`);
    const user = await response.json();

    return user;
}

function createRow(record) {
    const row = document.createElement("tr");

    const uname = document.createElement("td");
    uname.innerText = record.user;

    const cname = document.createElement("td");
    cname.innerText = record.customer;

    const date = document.createElement("td");
    date.innerText = formatDate(new Date(record.date));
    date.classList.add("date-column");

    const time = document.createElement("td");
    time.innerText = formatTime(new Date(record.date));
    time.classList.add("date-column");

    const subject = document.createElement("td");
    subject.innerText = record.subject;

    const price = document.createElement("td");
    price.innerText = `$${record.price}`;

    const actions = document.createElement("td");

    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteButton.classList.add("delete-button");
    deleteButton.onclick = createOnClick(record.id, row, deleteButton);

    const editLink = document.createElement("a");
    editLink.innerHTML = '<i class="fa-solid fa-pen"></i>';
    editLink.href = `new-edit.html?id=${record.id}`

    actions.append(editLink, deleteButton);

    row.append(date, time, uname, cname, subject, price, actions);

    return row;
}

function onDropDownClick() {
    const dropDownDiv = document.getElementById("dropdown-body");
    dropDownDiv.classList.toggle("hide");
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
    await printList(search.toLowerCase());

    const user = await getUser();

    const img = document.getElementById("image");
    img.src = user.picture;
}
