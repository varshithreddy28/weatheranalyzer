const express = require("express");
const axios = require('axios');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));


let monday = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
let mon = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

function checkLeapYear(year) {

    //three conditions to find out the leap year
    if ((0 == year % 4) && (0 != year % 100) || (0 == year % 400)) {
        return true
    } else {
        return false
    }
}

let month = function (num) {
    for (let i = 0; i < mon.length; i++) {
        if (num == mon[i]) {
            return [mon[i], monday[i]];
        }
    }
}

let day = function (y, m, d) {
    let year = checkLeapYear(y);
    if (year) {
        monday[1] = 29;
    }
    else {
        monday[1] = 28;
    }
    //console.log(monday);
    let a = month(m);
    var mon = a[0];
    let total = a[1];
    let dm = [];
    f = [y, m, d]
    dm.push(f);
    let final = [];
    for (let i = 0; i < 4; i++) {
        if (d == total) {
            mon = mon + 1;

            if (mon == 13) {
                mon = 1
                y += 1
            }

            d = 1
        }
        else {
            d = d + 1;
        }
        m = mon;
        f = [y, m, d]
        dm.push(f);
    }
    return dm
}

let datas = (c, list) => {
    let all = []
    console.table(c)
    // console.log(list[38])
    var fore = []
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < list.length; j++) {
            let x = list[j].dt_txt
            let ye = parseInt(x.slice(0, 4))
            let mo = parseInt(x.slice(5, 7))
            let da = parseInt(x.slice(8, 10))
            let time = parseInt(x.slice(11, 13))
            //console.log(ye,mo,da,c[i])
            if (ye == c[i][0] && mo == c[i][1] && da == c[i][2] && time == 12) {
                all.push(list[j])
                // console.log(i)
                break;
            }
        }
        fore.push(all)
        all = []
    }
    console.log(fore)
    return fore
}

async function getUser(apiKey, search) {
    try {
        const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${apiKey}`);
        const response1 = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?q=${search}&appid=${apiKey}`)
        const lat = response1.data.city.coord.lat
        const lon = response1.data.city.coord.lon
        const response2 = await axios.get(`http://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=7&appid=${apiKey}`)
        return [response, response1, response2];
    } catch (error) {
        return "error";
    }
}

let timeConversion = async (unixTimestamp) => {
    dateObj = new Date(unixTimestamp * 1000);
    utcString = dateObj.toUTCString();
    time = await utcString//gmt
    return time;
}


app.get('/', (req, res) => {
    res.render('search');
})

app.get('/weather/search', async (req, res) => {
    const apiKey = "23ae1d6ceea4c34543fd7c9557629a8b";
    const search = req.query.place;
    let results = await getUser(apiKey, search);
    if (results === "error") {
        res.render('error');
    }
    let result = results[0];
    let result_mul = results[1];
    const data = result.data;
    const data_mul = result_mul.data;
    const country = data.sys.country;
    const city = data.name;
    let windspeed = Math.floor(data.wind.speed * 3.6);//kph
    let temp = Math.floor(data.main.temp - 273.15);
    const min_temp = Math.floor(data.main.temp_min - 273.15);
    const max_temp = Math.floor(data.main.temp_max - 273.15); //k to c
    const humidity = data.main.humidity;
    const discription = data.weather[0].description;
    const icon = data.weather[0].icon;
    const icon_Url = `http://openweathermap.org/img/wn/${icon}@2x.png`
    //for 4 days fore cast
    const list = data_mul.list;
    const date = list[0].dt_txt;
    const year = parseInt(date.slice(0, 4))
    const month = parseInt(date.slice(5, 7))
    const date_ = parseInt(date.slice(8, 10))
    const c = await day(year, month, date_);
    const y = await datas(c, list)
    const forecast = []
    for (let i = 1; i < 5; i++) {
        forecast.push(y[i][0])
    }

    let data_day = []

    for (let i = 0; i < 4; i++) {
        const data = {
            temp: Math.floor(forecast[i].main.feels_like - 273.15),
            date: await timeConversion(forecast[i].dt),
            day: date.slice(0, 3),
            icon_d: forecast[i].weather[0].icon,
            icon: `http://openweathermap.org/img/wn/${forecast[i].weather[0].icon}@2x.png`,
            discription: forecast[i].weather[0].description,
        }
        data_day.push(data)
    }

    const result2 = results[2]
    const data_2 = result2.data
    const nearbyPlaces = data_2.list
    let near = []
    for (let i = 1; i < nearbyPlaces.length; i++) {
        let name = nearbyPlaces[i].name
        let temp = Math.floor(nearbyPlaces[i].main.feels_like - 273.15);
        let icon = nearbyPlaces[i].weather[0].icon;
        let discription = nearbyPlaces[i].weather[0].description;
        let iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`
        let all = [name, temp, discription, iconUrl]
        near.push(all);
    }

    const sunSet = await timeConversion(data.sys.sunset);
    const sunRise = await timeConversion(data.sys.sunrise);
    const currentdate = await timeConversion(data.dt);
    const sunSettime = sunSet.slice(-12);
    const sunRisetime = sunRise.slice(-12);
    const currentDate = currentdate.slice(0, 16)
    const weatherData = {
        country: country,
        city: city,
        sunSettime: sunSettime,
        sunRisetime: sunRisetime,
        date: currentDate,
        windSpeed: windspeed,
        temp: temp,
        mintemp: min_temp,
        maxtemp: max_temp,
        humidity: humidity,
        discription: discription,
        icon: icon_Url,
        data_day: data_day,
        nearbyPlaces: near
    }
    res.render('home', { weatherData: weatherData });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Connected to server ...")
})