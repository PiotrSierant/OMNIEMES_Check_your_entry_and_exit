export function filterData(data: string[][]) {
  let newData: string[][] = [];
  const datesCount: { [key: string]: number } = {};
    for (const entry of data) {
      const date = entry[0].split(' ')[0];
        datesCount[date] = (datesCount[date] || 0) + 1;
  }

  const res = Object.fromEntries(
    Object.entries(datesCount).filter(([key, value]) => value > 2)
  );
   
  data.forEach((element) => {
    const dateSplit = element[0].split(' ');
    const date = dateSplit[0];
    if (res[date]) {
    } else {
      newData.push(element)
    }
  })

  data.forEach((element) => {
    const dateSplit = element[0].split(' ');
    const date = dateSplit[0];
    if (res[date]) {
      const eventsWithTargetDate = data.filter(event => {
          const eventDate = event[0];
          return eventDate.startsWith(date);
      });
      newData.push(eventsWithTargetDate[0]);
      newData.push(eventsWithTargetDate[eventsWithTargetDate.length - 1]);
      delete res[date];
    }
  })

  return newData;
};

export function removeExtraEntries(data: string[][]) {
    const groupedData: { [date: string]: string[][] } = {};
    data.forEach(item => {
        const dateWithoutTime = item[0].split(" ")[0];
        if (!groupedData[dateWithoutTime]) {
            groupedData[dateWithoutTime] = [];
        }
        groupedData[dateWithoutTime].push(item);
    });
    const result: string[][] = [];

    for (const date in groupedData) {
        const dateItems = groupedData[date];
        if (dateItems.length === 1) {
            result.push(dateItems[0]);
        } else {
            dateItems.sort((a, b) => {
                const dateA = new Date(a[0]).getTime(); // Pobieramy czas w milisekundach
                const dateB = new Date(b[0]).getTime(); // Pobieramy czas w milisekundach
                return dateA - dateB;
            });
            result.push(dateItems[0]);
            result.push(dateItems[1]);
        }
    }
    return result;
};

export function addMissingEntries(data: string[][]) {
  const datesCount: { [key: string]: number } = {};
    for (const entry of data) {
      const date = entry[0].split(' ')[0];
        datesCount[date] = (datesCount[date] || 0) + 1;
  }
  for (let i = 0; i < data.length; i++) {
    const dateSplit = data[i][0].split(' ');
    const date = dateSplit[0];
    const hours = dateSplit[1] + dateSplit[2];
    if (datesCount[date] === 1) {
        const isAM = hours.includes("AM");
        const missingEntry = [date, "brak danych", "brak danych", data[i][3]];
      if (isAM) {
        data.splice(i, 0, missingEntry); // Dodaj przed wpisem
        i++;
      } else {
        data.splice(i + 1, 0, missingEntry); // Dodaj po wpisie
        i++;
      }
    }
  }
  return data
};

export function calculateWorkTime(data: string[][]): { [date: string]: { time: string; } } {
    const workTime: { [date: string]: any } = {};
    data.forEach(item => {
      const date = item[0];
      const dateSingle = item[0].split(" ")[0];
      if (!workTime[dateSingle]) {
            workTime[dateSingle] = {};
        }
      if (date.includes('AM')) {
        workTime[dateSingle].start = date
      }
      if (date.includes('PM')) {
        workTime[dateSingle].end = date
      }
    });
  
    const keys = Object.keys(workTime);
    keys.forEach(key => {
      const start = workTime[key].start;
      const end = workTime[key].end;
      if (start === undefined) {
        workTime[key].start = ""
      } else if (end === undefined) {
        workTime[key].end = ""
      }
    });
    for (const date in workTime) {
      const start = new Date(workTime[date].start).getTime();
      const end = new Date(workTime[date].end).getTime();
      if (Number.isNaN(start)) {
        workTime[date] = {};
        workTime[date].time = "Nie można obliczyć h pracy"
      }
      else if (Number.isNaN(end)) {
        workTime[date] = {};
        workTime[date].time = "Nie można obliczyć h pracy"
      } else {
        const results = (end - start) / (1000 * 60);
        const hours = Math.floor(results / 60);
        const minutes = results % 60;
        workTime[date] = {};
        workTime[date].time = hours + 'h, ' + Math.floor(minutes) +'min.'
      }
  }
  return workTime;
};

export function addTime(data: string[][], object: { [key: string]: { time: string } }) {
  const res = data.map((element, index) => {
    let date = element[0].split(" ")[0];
    if (index % 2 === 0) {
    element.push(object[date].time)      
    } else {
      element.push("")      
    }
    return element
  })
  return res
};

export function calculateExtraHours(data: string[][]) {
  const mappedData = data
    .map(element => element[element.length - 1])
    .filter(element => element !== "")
    .filter(element => element !== "Nie można obliczyć h pracy")
    .map(element => element.replace("min.", "").split("h, "))
    .map(element => element.map(item => Number(item)));
  
  const extraHours = mappedData.map(element => element[0] - 8).filter(item => item >= 1).reduce((a, b) => a + b, 0);
  const extraMinutes = mappedData.map(element => element[1]).reduce((a, b) => a + b, 0);

  const extraHoursFromMinutes = extraMinutes / 60;
  const restMinutes = extraMinutes % 60;

  // Oblicz całkowite godziny, uwzględniając resztę minut
  const totalExtraHours = extraHours + Math.floor(extraHoursFromMinutes) + "h " + restMinutes + "min.";

  return totalExtraHours
};

export function formatDate(date: Date) {
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
}