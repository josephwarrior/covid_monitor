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
  interpolateStats(
    list,
    "2020-06-08",
    "2020-06-17",
    5571,
    7257,
    "deaths",
    "Peru"
  );
  return [list, countryList];
};

const getDateCountryListObjectWODailyValues = (dataMatrix) => {
  let list = {};
  dataMatrix.forEach((item) => {
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
  const previousDateString = getPreviousDateString(item.date);
  let previousValue = 0;
  if (!!list[previousDateString] && !!list[previousDateString][item.country]) {
    previousValue = list[previousDateString][item.country][queryType];
  }
  const currentValue = item[queryType];
  const queryValue =
    previousValue > currentValue ? previousValue : currentValue;

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
  const currentDate = convertStringToDate(currentDateString);
  const previousDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() - 1
  );
  const previousDateString = convertDateToString(previousDate);
  return previousDateString;
};

export const convertDateToString = (originalDate) => {
  const date = new Date(originalDate);
  const yearString = date.getFullYear();
  const monthString =
    date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
  const dateString =
    date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  return yearString + "-" + monthString + "-" + dateString;
};

export const convertStringToDate = (dateString) => {
  const year = Number(dateString.split("-")[0]);
  const month = Number(dateString.split("-")[1]) - 1;
  const day = Number(dateString.split("-")[2]);
  return new Date(year, month, day);
};

export const getTopLists = (perCountryArrays, dateIndex, n) => {
  const observableCountriesArray = Object.keys(
    getObservableList(perCountryArrays)
  );
  let [
    topNConfirmedList,
    topNDeathsList,
    topNRatioList,
    topNDailyConfirmedList,
    topNDailyDeathsList,
    topNDailyRatioList,
  ] = sortTopNLists(perCountryArrays, dateIndex, n);
  const topConfirmedList = topNConfirmedList.filter((countryInfo) => {
    return observableCountriesArray.some(
      (country) => country === countryInfo.country
    );
  });
  const topDeathsList = topNDeathsList.filter((countryInfo) => {
    return observableCountriesArray.some(
      (country) => country === countryInfo.country
    );
  });
  const topRatioList = topNRatioList.filter((countryInfo) => {
    return observableCountriesArray.some(
      (country) => country === countryInfo.country
    );
  });
  return [topConfirmedList, topDeathsList, topRatioList];
};

const sortTopNLists = (perCountryArrays, dateIndex, n) => {
  const completeList = Object.values(perCountryArrays[dateIndex]);
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

export const getObservableList = (perCountryArrays) => {
  let observableCountriesObj = {};
  let completeConfirmedLists = {};
  let completeDeathsLists = {};

  perCountryArrays.forEach((countryInfo, dateIndex) => {
    let [
      topNConfirmedList,
      topNDeathsList,
      topNDailyConfirmedList,
      topNDailyDeathsList,
      topNDailyRatioList,
    ] = sortTopNLists(perCountryArrays, dateIndex, 20);
    let completeDate = topNConfirmedList[0].date;
    completeConfirmedLists[completeDate] = topNConfirmedList;
    completeDeathsLists[completeDate] = topNDeathsList;

    const confirmedCountriesObject = convertListToCountriesObject(
      topNConfirmedList
    );
    const deathsCountriesObject = convertListToCountriesObject(topNDeathsList);
    observableCountriesObj = {
      ...observableCountriesObj,
      ...confirmedCountriesObject,
      ...deathsCountriesObject,
    };
  });

  return [observableCountriesObj, completeConfirmedLists, completeDeathsLists];
};

const convertListToCountriesObject = (list) => {
  const listEntry = new Map(
    list.map((countryInfo) => [countryInfo.country, 1])
  );
  return Object.fromEntries(listEntry);
};

export const getCompleteRatioLists = (perCountryArrays) => {
  let completeRatioLists = {};
  perCountryArrays.forEach((countryInfo, dateIndex) => {
    let topNRatioList = getTopNRatioList(perCountryArrays, dateIndex, 11);
    let completeDate = topNRatioList[0].date;
    completeRatioLists[completeDate] = topNRatioList;
  });
  return completeRatioLists;
};

const getTopNRatioList = (perCountryArrays, dateIndex, n) => {
  const completeList = Object.values(perCountryArrays[dateIndex]);
  const sortedList = completeList.sort((a, b) => b.ratio - a.ratio);
  const [topNConfirmedList, topNDeathsList] = sortTopNLists(
    perCountryArrays,
    dateIndex,
    9
  );
  const confirmedCountriesObject = convertListToCountriesObject(
    topNConfirmedList
  );
  const deathsCountriesObject = convertListToCountriesObject(topNDeathsList);
  const observableCountriesObj = {
    ...Object.keys(confirmedCountriesObject),
    ...Object.keys(deathsCountriesObject),
  };
  const observableCountriesArray = Object.values(observableCountriesObj);

  const topNList = sortedList.filter((register, index) => {
    return observableCountriesArray.includes(register.country);
  });
  return topNList;
};

const interpolateStats = (
  completeLists,
  startDateString,
  endDateString,
  startDateStat,
  endDateStat,
  queryType,
  country
) => {
  const startDate = convertStringToDate(startDateString);
  const endDate = convertStringToDate(endDateString);
  const msPerDay = 1000 * 60 * 60 * 24;
  const lapsedDays = (endDate.getTime() - startDate.getTime()) / msPerDay;
  const increment = (endDateStat - startDateStat) / lapsedDays;
  let instantDate = startDate;
  let instantDateString = startDateString;
  for (let i = 0; i <= lapsedDays; i++) {
    instantDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + i
    );
    instantDateString = convertDateToString(instantDate);

    completeLists[instantDateString][country][queryType] = (
      startDateStat +
      i * increment
    ).toFixed(0);
  }
};
