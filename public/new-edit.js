const url = location.hostname === '' ? "https://cusco-api.vercel.app/api" : "/api";

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

function setDateToToday() {
    const date = document.getElementById("date");
    const today = new Date();
    date.value = formatDate(today);
}

function onInputKeyUp(event) {
    const input = event.target;
    if (!input.checkValidity()) {
        input.classList.add('highlight');
    } else {
        input.classList.remove('highlight');
    }
}

async function getRecords() {
    const response = await fetch(url);
    const records = await response.json();

    return records;
}

const allRecords = getRecords();

async function onClickSave() {
    const inputs = [
        ...document.getElementsByTagName("input"),
        ...document.getElementsByTagName("textarea")
    ]

    for (const input of inputs) {
        if (!input.checkValidity()) {
            input.classList.add('highlight');
        }
    }

    const highlightedInputs = document.getElementsByClassName("highlight");
    if (highlightedInputs.length > 0) {
        highlightedInputs[0].focus();
        return;
    }

    const user = document.getElementById("uname").value;
    const branch = document.getElementById("branch").value;
    const customer = document.getElementById("cname").value;
    const phone_number = document.getElementById("cphone").value;
    const subject = document.getElementById("subject").value;
    const price = document.getElementById("price").value;
    const explanation = document.getElementById("explanation").value;

    const record = {
        customer,
        user,
        date: (new Date()).toISOString(),
        branch,
        subject,
        price,
        explanation,
        phone_number
    }

    const response = await fetch(id ? `${url}/${id}` : url, {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(record),
        headers: {
            "Content-Type": "application/json"
        }
    })

    if (response.ok) {
        // redirect to main page
        location.href = "./index.html"
    } else {
        alert("Error");
    }

}

window.onload = async function () {

    if (id) {
        response = await fetch(`${url}/${id}`, {
            method: "GET"
        })

        if (response.ok) {
            const record = await response.json();
            console.log(record)
            document.getElementById("uname").value = record.user;
            document.getElementById("branch").value = record.branch;
            document.getElementById("cname").value = record.customer;
            document.getElementById("cphone").value = record.phone_number;
            document.getElementById("subject").value = record.subject;
            document.getElementById("price").value = record.price
            document.getElementById("explanation").value = record.explanation;
        } else {
            alert("Data can not be updated, try again");
            location.href = "./index.html";
        }
    }

    setDateToToday();
}