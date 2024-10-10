function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatTime(date) {
    const h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const hours = h % 12 ?? 12; // '0' becomes '12'
    const minutes = m < 10 ? "0" + m : m;
    return `${hours}:${minutes} ${ampm}`;
}
