export const getRegistersFetchB = () => {
  return fetch("./coviddata.json")
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => Promise.reject(err));
      }
      return response.json();
    })
    .then((dataObject) => dataObject.data);
};

export const getDataFetch = () => {
  const url = "https://covid-api.com/api/reports?date=2020-01-28";
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => Promise.reject(err));
      }
      return response.json();
    })
    .then((dataObject) => dataObject.data);
};

export const getRegistersFetch = () => {
  return fetch("/registers")
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => Promise.reject(err));
      }
      return response.json();
    })
    .then((dataObject) => dataObject.data);
};

export const getMultipleDataFetch = () => {
  return Promise.all(getFetchArray())
    .then((allResponses) => {
      return Promise.all(allResponses.map((response) => response.json()));
      //return allResponses;
      /* if (!response.ok) {
        return response.json().then((err) => Promise.reject(err));
      }*/
      //   return response;
    })
    .then((dataObject) => {
      return dataObject;
    });
};

const getFetchArray = () => {
  const urlArray = getUrlArray();
  return urlArray.map((url) => fetch(url));
};

const getUrlArray = () => {
  const dateStringArray = getDateStringArray();
  return dateStringArray.map((dateString) => {
    return dateStringToUrl(dateString);
  });
};

const dateStringToUrl = (datestring) => {
  return "https://covid-api.com/api/reports?date=" + datestring;
};

const getDateStringArray = () => {
  let dateStringArray = [];
  const startDate = new Date(2020, 2, 5);
  const tempCurrentDate = new Date(2020, 2, 15);
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
