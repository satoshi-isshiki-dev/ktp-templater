// DOM Elements
const form = document.getElementById("input-form")
const outputDiv = document.getElementById("output")
const links = document.querySelector("a")
const actionButton = document.getElementById("good-btn")
const generateTableButton = document.getElementById("gen-date")
const generateInputsButton = document.getElementById("gen-input-fields")
const inputFields = document.getElementById("input-fields");


// State Variable
let dates = []

// Event Listeners
form.addEventListener("submit", submitForm)
links.addEventListener("click", preventDefaultAction)
actionButton.addEventListener("click", submitForm)
generateTableButton.addEventListener("click", generateDates)
generateInputsButton.addEventListener("click", generateInputs)

// Functions
function submitForm(e) {
  e.preventDefault();
  const formData = new FormData(form);
  const data = objectifyFormData(formData);
  sendRequest(data);
}


function preventDefaultAction(event) {
  event.preventDefault();
}

function objectifyFormData(formData) {
  return [...formData.entries()].reduce(
    (obj, [key, value]) => ({ ...obj, [key]: value }),
    {}
  );
}

async function sendRequest(data) {
  try {
    const blob = await fetchBlobFromServer(data);
    downloadFile(blob);
  } catch (error) {
    console.error(error.message)
  }
}

async function fetchBlobFromServer(data) {
  const response = await fetch("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await response.blob();
}

function downloadFile(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "generated.docx";
  link.click();
}

function isHoliday(date) {
  // 1, 2, 3, 4, 5, 6 и 8 января - Новогодние каникулы;
  // 7 января - Рождество Христово;
  // 23 февраля - День защитника Отечества;
  // 8 марта - Международный женский день;
  // 1 мая - Праздник Весны и Труда;
  // 9 мая - День Победы;
  // 12 июня - День России;
  // 4 ноября - День народного единства.

  // В 2023 году в соответствии с Постановлением Правительства РФ от 29 августа 2022 г. N 1505
  // "О переносе выходных дней в 2023 году" перенесены следующие выходные дни:
  // ! с воскресенья 1 января на пятницу 24 февраля;
  // ! с субботы 8 января на понедельник 8 мая.

  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (month === 2 && (day === 23 || day === 24)) return true; // 23 февраля
  if (month === 3 && day === 8) return true; // 8 марта
  if (month === 5 && (day === 1 || day === 8 || day === 9)) return true; // Майские праздники
  if (month === 11 && day === 4) return true; // 4 ноября
  if (month === 6 && day === 12) return true; // 12 июня
  if (
    month === 1 &&
    (day === 1 ||
      day === 2 ||
      day === 3 ||
      day === 4 ||
      day === 5 ||
      day === 6 ||
      day === 7 ||
      day === 8)
  )
    return true; // Новогодние праздники

  return false;
}

function generateDates() {
  dates = [];
  const startYear = document.getElementById("start-year").value;
  const endYear = document.getElementById("end-year").value;
  const startMonth = document.getElementById("start-month").value;
  const endMonth = document.getElementById("end-month").value;
  const startDate = document.getElementById("start-day").value;
  const hours = document.getElementById("hours").value;

  const daysOfWeek = [];
  const checkboxes = document.getElementsByName("days[]");

  document.getElementById("dates-table-body").innerHTML = "";

  for (const checkbox of checkboxes) {
    if (checkbox.checked) {
      daysOfWeek.push(+checkbox.value);
    }
  }

  let currentDate = new Date(startYear, startMonth - 1, startDate);
  let daysCounter = 0;

  while (daysCounter < hours / 2) {
    if (daysOfWeek.includes(currentDate.getDay()) && !isHoliday(currentDate)) {
      dates.push(getFormattedDate(currentDate));
      daysCounter++;
    }
    currentDate.setDate(currentDate.getDate() + 1);

    if (
      currentDate.getFullYear() > endYear ||
      (currentDate.getFullYear() == endYear &&
        currentDate.getMonth() + 1 > endMonth)
    ) {
      if (dates.length < 36) {
        const nextMonth = currentDate.getMonth() + 1;
        let nextDate = new Date(startYear, nextMonth, 1);
        while (
          dates.length < 36 &&
          (nextDate.getFullYear() < endYear ||
            (nextDate.getFullYear() == endYear &&
              nextDate.getMonth() + 1 <= endMonth))
        ) {
          if (daysOfWeek.includes(nextDate.getDay()) && !isHoliday(nextDate)) {
            dates.push(getFormattedDate(nextDate));
          }
          nextDate.setDate(nextDate.getDate() + 1);
        }
      }
      break;
    }
  }

  generateTable(dates)

  if (dates.length != 0) {
    generateInputsButton.classList.remove('hide')
  } else {
    generateInputsButton.classList.add('hide')
    inputFields.innerHTML = ''
    actionButton.classList.add('hide')
  }
}

function generateInputs() {
  
  inputFields.innerHTML = ''; // Очищаем содержимое контейнера

  for (let i = 0; i < dates.length; i++) {
      const inputContainer = document.createElement("div");
      inputContainer.classList.add("input-container");

      const inputDate = document.createElement("input");
      inputDate.type = "text";
      inputDate.name = "date_" + (i + 1);
      inputDate.classList.add('left')
      inputDate.value = dates[i];

      const inputHead = document.createElement("input");
      inputHead.type = "text";
      inputHead.classList.add('right')
      inputHead.name = "head_" + (i + 1);

      inputContainer.appendChild(inputDate);
      inputContainer.appendChild(inputHead);
      inputFields.appendChild(inputContainer);
  }

  document.getElementById('good-btn').classList.remove('hide')
}

function getDayOfWeek(date) {
  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
  return daysOfWeek[date.getDay()];
}

function getFormattedDate(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();
  return `${day}.${month}.${year}`;
}

function generateTable(dates) {
  // Clear elements before generation
  generateInputsButton.classList.add('hide')
  inputFields.innerHTML = ''
  actionButton.classList.add('hide')
  
  // Get the dates
  // Group the dates by month
  const datesByMonth = {};
  for (const date of dates) {
    const month = date.substr(3, 2); // Extract month from date string
    if (!datesByMonth[month]) {
      datesByMonth[month] = [];
    }
    datesByMonth[month].push(date);
  }

  // Get the table element
  const table = document.getElementById("dates-table-body")
  const tableBorder = document.querySelector(".table-border")
  tableBorder.classList.add('show')

  // Create a header row with month names
  const headerRow = table.insertRow();
  headerRow.classList.add("header-row");
  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];
  const validMonths = [];
  for (let i = 0; i < monthNames.length; i++) {
    const monthString = (i + 1).toString().padStart(2, "0");
    if (datesByMonth[monthString]) {
      // Check if the month is in datesByMonth
      validMonths.push(monthString);
    }
  }

  // Сортируем массив чтобы первый месяц был сентябрь
  // Создаем объект для определения порядка сортировки
  const sortingOrder = {
    "09": 0,
    "10": 1,
    "11": 2,
    "12": 3,
    "01": 5,
    "02": 6,
    "03": 7,
    "04": 8,
    "05": 9,
    "06": 10,
    "07": 11,
    "08": 12,
  };
  // Сортируем массив на основе порядка сортировки
  const filtredMonths = validMonths.sort(
    (a, b) => sortingOrder[a] - sortingOrder[b]
  );

  for (const month of filtredMonths) {
    const cell = headerRow.insertCell();
    cell.innerHTML = monthNames[parseInt(month) - 1];
  }

  // Create a row for each day
  const numRows = Math.max(
    ...Object.values(datesByMonth).map((monthDates) => monthDates.length)
  ); // Get the number of rows needed
  count = 0;
  for (let row = 0; row < numRows; row++) {
    const tableRow = table.insertRow();
    for (const month of validMonths) {
      const cell = tableRow.insertCell();
      if (datesByMonth[month] && datesByMonth[month][row]) {
        cell.innerHTML = datesByMonth[month][row];
        count++;
      }
    }
  }
  tableRow = table.insertRow();
  const cell = tableRow.insertCell();
  cell.innerHTML = `<h2>Всего: ${count} занятий</h2>`;
  cell.colSpan = 12;
}
