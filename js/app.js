const url = (beginDate, endDate, lang, query) => {
    return `http://www.vizgr.org/historical-events/search.php?html=false&links=false&format=xml&begin_date=${beginDate}&end_date=${endDate}&lang=${lang}&query=${query}` };

const contentContainer = document.querySelector('.content-container');
const loadingContainer = document.querySelector('.loading-container');

const lastYearsInput = document.querySelector('#last-years-input');
const languageSelect = document.querySelector('#language-select');
const keywordInput = document.querySelector('#keyword-input');
const searchButton = document.querySelector('#search-button');

function parseXML(text) {
    if (window.DOMParser) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(text, "text/xml");
        return xmlDoc;
    }
    else {
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(text);
        return xmlDoc;
    }
}

function monthFromIndex(index) {
    switch (index) {
        case 0:
            return 'January';
        case 1:
            return 'February';
        case 2:
            return 'March';
        case 3:
            return 'April';
        case 4:
            return 'May';
        case 5:
            return 'June';
        case 6:
            return 'July';
        case 7:
            return 'August';
        case 8:
            return 'September';
        case 9:
            return 'October';
        case 10:
            return 'November';
        case 11:
            return 'December';
    }

}

function populateEvents(beginDate, endDate, lang, query) {
    //console.log(url(beginDate, endDate, lang, query));
    loadingContainer.classList.remove('loading-container-invisible');
    contentContainer.innerHTML = '';
    var usableData = new Array();
    fetch(url(beginDate, endDate, lang, query)).then((result) => {
        result.text().then((text) => {
            let xmlFile = parseXML(text);
            let events = xmlFile.querySelectorAll('event');
            let oldYear = new Date(events[0].childNodes[0].textContent).getFullYear();
            let oldMonth = new Date(events[0].childNodes[0].textContent).getMonth();

            for (let i = 0; i < events.length; i++) {
                console.log(events[i]);
                let date = new Date(events[i].childNodes[0].textContent);
                let description = events[i].childNodes[1].textContent.replace(/{.*}/, '');
                usableData.push({ year: date.getFullYear(), month: date.getMonth(), day: date.getDate(), description: description });
            }

            let years = [...new Set(usableData.map(item => item.year))];
            let months = [...new Set(usableData.map(item => item.month))];

            years.map((year) => {
                //console.log(year);

                let yearContainer = document.createElement('div');
                yearContainer.classList.add('year-container');

                let yearDiv = document.createElement('div');
                yearDiv.classList.add('year');

                let rotatedYear = document.createElement('div');
                rotatedYear.classList.add('rotated-date');
                rotatedYear.textContent = year;

                yearDiv.appendChild(rotatedYear);
                yearContainer.appendChild(yearDiv);

                let yearBody = document.createElement('div');
                yearBody.classList.add('year-body');
                months.map((month) => {
                    //console.log(month);

                    let monthContainer = document.createElement('div');
                    monthContainer.classList.add('month-container');

                    let monthDiv = document.createElement('div');
                    monthDiv.classList.add('month');

                    let rotatedMonth = document.createElement('div');
                    rotatedMonth.classList.add('rotated-date');
                    rotatedMonth.textContent = monthFromIndex(month);

                    monthDiv.appendChild(rotatedMonth);
                    monthContainer.appendChild(monthDiv);
                    yearBody.appendChild(monthContainer);

                    let events = usableData.filter((data) => {
                        return data.year == year && data.month == month;
                    });
                    //console.log(events);

                    let eventContainer = document.createElement('div');
                    eventContainer.classList.add('event-container');
                    events.map((event) => {
                        let eventDiv = document.createElement('div');
                        eventDiv.classList.add('event');

                        let eventDay = document.createElement('div');
                        eventDay.classList.add('event-day');
                        eventDay.textContent = event.day;

                        let eventDescription = document.createElement('div');
                        eventDescription.classList.add('event-description')
                        eventDescription.innerHTML = event.description;

                        eventDiv.appendChild(eventDay);
                        eventDiv.appendChild(eventDescription);

                        eventContainer.appendChild(eventDiv);
                    });
                    monthContainer.appendChild(eventContainer);

                    if (events.length <= 0) {
                        monthContainer.style.display = 'none';
                    }
                });
                yearContainer.appendChild(yearDiv);
                yearContainer.appendChild(yearBody);

                loadingContainer.classList.add('loading-container-invisible');

                contentContainer.appendChild(yearContainer);
            });

        });
    }).catch((error) => {
        //console.log(error);
    })
}

searchButton.addEventListener('click', (event) => {
    let beginDate = `${new Date().getUTCFullYear() - lastYearsInput.value} ${new Date().getMonth()} ${new Date().getDate()}`.replace(/\s/g, '');
    let endDate = `${new Date().getUTCFullYear()} ${new Date().getMonth()} ${new Date().getDate()}`.replace(/\s/g, '');
    //console.log(beginDate);
    populateEvents(beginDate, endDate, languageSelect.options[languageSelect.selectedIndex].value, keywordInput.value);
});


let currentDate = `${new Date().getUTCFullYear()} ${new Date().getMonth()} ${new Date().getDate()}`.replace(/\s/g, '');

populateEvents(20070101, currentDate, 'en', '');