const fetch = require("node-fetch");
const all = require("node-promise").all;

const getMultipleDataFetch = (startDateString, endDateString) => {
  return Promise.all(getFetchArray(startDateString, endDateString))
    .then((allResponses) => {
      return Promise.all(allResponses.map((response) => response.json()));
    })
    .then((dataObjectArray) => {
      return dataObjectArray;
    });
};

const getFetchArray = (startDateString, endDateString) => {
  const urlArray = getUrlArray(startDateString, endDateString);
  return urlArray.map((url) => fetch(url));
};

const getUrlArray = (startDateString, endDateString) => {
  const dateStringArray = getDateStringArray(startDateString, endDateString);

  return dateStringArray.map((dateString) => {
    return dateStringToUrl(dateString);
  });
};

const dateStringToUrl = (datestring) => {
  return "https://covid-api.com/api/reports?date=" + datestring;
};

const getDateStringArray = (startDateString, endDateString) => {
  let dateStringArray = [];
  const startDate = convertStringToDate(startDateString);
  const tempCurrentDate = convertStringToDate(endDateString);
  const currentDate = new Date(
    tempCurrentDate.getFullYear(),
    tempCurrentDate.getMonth(),
    tempCurrentDate.getDate()
  );

  let elapsedDays = 0;
  let iterDate = new Date(startDate);

  while (iterDate < currentDate) {
    dateStringArray.push(convertDateToString(iterDate));
    elapsedDays++;
    iterDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + elapsedDays
    );
  }

  return dateStringArray;
};

const convertDateToString = (originalDate) => {
  const date = new Date(originalDate);
  const yearString = date.getFullYear();
  const monthString =
    date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
  const dateString =
    date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  return yearString + "-" + monthString + "-" + dateString;
};

const convertStringToDate = (dateString) => {
  const year = Number(dateString.split("-")[0]);
  const month = Number(dateString.split("-")[1]) - 1;
  const day = Number(dateString.split("-")[2]);
  return new Date(year, month, day);
};

module.exports = { getMultipleDataFetch };
