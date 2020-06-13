const transformDataToListObject = (sourceDataArray) => {
  // console.log("transformDataToListObject has been called");
  let listObject = {};
  sourceDataArray.forEach((dataObject) => {
    // console.log(dataObject);
    dataObject.data.forEach((item) => {
      let iterDate = item.date;
      let iterCountry = item.region.name;
      let iterProvince = item.region.province;
      let iterDeaths = item.deaths;
      let iterConfirmed = item.confirmed;
      let iterId = iterDate + iterCountry + iterProvince;
      let updItem = {
        _id: iterId,
        date: iterDate,
        country: iterCountry,
        province: iterProvince,
        deaths: iterDeaths,
        confirmed: iterConfirmed,
      };
      //console.log(updItem);
      listObject[iterId] = updItem;
    });
  });
  // console.log(listObject);
  return listObject;
};

const sumItems = (itemA, itemB) => {
  return {
    date: itemA.date,
    country: itemA.country,
    province: itemA.province,
    deaths: itemA.deaths + itemB.deaths,
    confirmed: itemA.confirmed + itemB.confirmed,
  };
};

module.exports = { transformDataToListObject };
