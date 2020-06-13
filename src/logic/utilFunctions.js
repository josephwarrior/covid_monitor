export const getDateCountryListObject = (dataMatrix) => {
  let list = {};
  let countryList = {};
  const dateCountryListWO = getDateCountryListObjectWODailyValues(dataMatrix);
  Object.values(dateCountryListWO).forEach((perCountryList) => {
    Object.values(perCountryList).forEach((item) => {
      countryList[item.country] = item.country;
      item.confirmed = getItemQueryValue(item, list, "confirmed");
      item.deaths = getItemQueryValue(item, list, "deaths");
      item.ratio = getItemRatio(item, "cummulative");
      item.dailyConfirmed = getDailyValue(item, list, "confirmed");
      item.dailyDeaths = getDailyValue(item, list, "deaths");
      item.dailyRatio = getItemRatio(item, "daily");
      list[item.date] = !list[item.date] ? {} : list[item.date];
      list[item.date][item.country] = item;
    });
  });
  return [list, countryList];
};

const getDateCountryListObjectWODailyValues = (dataMatrix) => {
  // console.log(dataMatrix);
  let list = {};
  // let countryList = {}; // <=====================================
  dataMatrix.forEach((item) => {
    //countryList[item.country] = item.country; // <===============
    list[item.date] = !list[item.date] ? {} : list[item.date];
    delete item._id;
    delete item.province;

    if (!list[item.date][item.country]) {
      list[item.date][item.country] = item;
    } else {
      list[item.date][item.country] = sumItems(
        list[item.date][item.country],
        item
      );
    }
  });
  return list;
};

const sumItems = (itemA, itemB) => {
  return {
    date: itemA.date,
    country: itemA.country,
    deaths: itemA.deaths + itemB.deaths,
    confirmed: itemA.confirmed + itemB.confirmed,
  };
};

const getDailyValue = (item, list, queryType) => {
  const previousDateString = getPreviousDateString(item.date);

  const dailyValue =
    !list ||
    !list[previousDateString] ||
    !list[previousDateString][item.country]
      ? item[queryType]
      : item[queryType] - list[previousDateString][item.country][queryType];

  return dailyValue;
};

const getItemQueryValue = (item, list, queryType) => {
  //if (item.country === "France") console.log(item);
  const previousDateString = getPreviousDateString(item.date);
  let previousValue = 0;
  if (!!list[previousDateString] && !!list[previousDateString][item.country]) {
    previousValue = list[previousDateString][item.country][queryType];
    /* if (item.country === "France")
      console.log(list[previousDateString][item.country][queryType]); */
  }
  const currentValue = item[queryType];
  const queryValue =
    previousValue > currentValue ? previousValue : currentValue;
  /*   if (item.country === "France")
    console.log(
      "date: " +
        item.date +
        ", queryValue: " +
        queryValue +
        ", previousValue: " +
        previousValue +
        ", currentValue: " +
        currentValue
    ); */
  return queryValue;
};

const getItemRatio = (item, type) => {
  switch (type) {
    case "cummulative":
      return item.dailyConfirmed === 0
        ? 0
        : (item.deaths / item.confirmed) * 100;
    case "daily":
      return item.dailyConfirmed === 0
        ? 0
        : (item.dailyDeaths / item.dailyConfirmed) * 100;
    default:
      return 0;
  }
};

const getPreviousDateString = (currentDateString) => {
  //console.log(currentDateString);
  const currentDate = convertStringToDate(currentDateString);
  const previousDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() - 1
  );
  const previousDateString = convertDateToString(previousDate);
  return previousDateString;
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

export const convertStringToDate = (dateString) => {
  //console.log(dateString);
  const year = Number(dateString.split("-")[0]);
  const month = Number(dateString.split("-")[1]) - 1;
  const day = Number(dateString.split("-")[2]);
  return new Date(year, month, day);
};

export const sortTopNLists = (perCountryArrays, dateIndex, n) => {
  const completeList = Object.values(perCountryArrays[dateIndex]);
  // sorting the data
  const topNConfirmedList = getTopNList(completeList, "confirmed", n);
  const topNDeathsList = getTopNList(completeList, "deaths", n);
  const topNRatioList = getTopNList(completeList, "ratio", n);
  const topNDailyConfirmedList = getTopNList(completeList, "dailyConfirmed", n);
  const topNDailyDeathsList = getTopNList(completeList, "dailyDeaths", n);
  const topNDailyRatioList = getTopNList(completeList, "dailyRatio", n);
  return [
    topNConfirmedList,
    topNDeathsList,
    topNRatioList,
    topNDailyConfirmedList,
    topNDailyDeathsList,
    topNDailyRatioList,
  ];
};

const getTopNList = (completeList, queryType, n) => {
  const sortedList = completeList.sort((a, b) => b[queryType] - a[queryType]);
  const topNList = sortedList.filter((register, index) => index <= n);
  return topNList;
};
