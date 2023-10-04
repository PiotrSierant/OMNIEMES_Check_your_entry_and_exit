"use client";
import React, { useCallback, useEffect, useState } from "react";
import { SelectDatepicker } from 'react-select-datepicker';
import { filterData, removeExtraEntries, addMissingEntries, calculateWorkTime, addTime, calculateExtraHours, formatDate } from '../helpers/csv-function'
import { options } from "../helpers/csv-options";
import CSVSelector from "./CSVSelector";
  
const CSVReader = () => {
  const [data, setData] = useState<string[][]>([]);
  const [resData, setResData] = useState<string[][]>([]);
  const [resDataTitle, setResDataTitle] = useState<string[]>([]);
  const [extraHours, setExtraHours] = useState<string>();
  const [showTime, setShowTime] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<string>("");
  const [valueFrom, setValueFrom] = useState<Date | null>();
  const [valueTo, setValueTo] = useState<Date | null>();
  const [orginalData, setOrginalData] = useState<string[][]>([]);

  useEffect(() => {
    if (data.length) {
      const filteredLists = data.slice(1, data.length - 7).map(arr => arr.slice(2)).map(arr => arr.slice(0, arr.length - 3)).map(arr => arr.slice());
      const headers = data[0]?.filter(header => header !== "");
      const filteredArrays = filteredLists.map(row => row.filter((value, index) => headers[index] !== "" ? value : undefined));
      const results = filteredArrays.map((element) => element.filter((_, index) => index !== 2));
      const title = results[0];
      const filteredResults = results.filter(element => element.includes("Door Access Granted")).map(arr => arr.map(element => element.replace(/\[\d+\]: /g, '')));
      const test = filterData(filteredResults);
      const finnalyTitle = title?.filter((_, index) => index !== 1);
      const finnalyBody = test.map(element => element.filter((_, index) => index !== 1));
      const res = removeExtraEntries(finnalyBody).sort((a: string[], b: string[]) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
      const addingMissingEntries = addMissingEntries(res);
      const calculate = calculateWorkTime(res);
      const resultsCVS = addTime(addingMissingEntries, calculate);
      finnalyTitle?.push('Czas pracy');

      const workTimeExtraHours = calculateExtraHours(resultsCVS);
      setResData(resultsCVS);
      setOrginalData(resultsCVS);
      setResDataTitle(finnalyTitle);
      setExtraHours(workTimeExtraHours);
      if (resultsCVS.length && resultsCVS) {
        const from = resultsCVS[resultsCVS.length - 1][0].split(" ")[0];
        const to = resultsCVS[0][0].split(" ")[0];
        setDateRange(`${from} do ${to}`)
        setShowTime(true);
      }
    }
  }, [data]);

  const changeArr = useCallback((dateFrom: string | null | Date | undefined, dateTo: string | null | Date | undefined) => {
    if (dateFrom === undefined || dateTo === undefined || dateFrom === null || dateTo === null) return
    const myArr = orginalData;
    const filteredResData = myArr.filter(element => {
      const elementDate = new Date(element[0].split(' ')[0]);
      return elementDate >= new Date(dateFrom) && elementDate <= new Date(dateTo);
    });

    setResData(filteredResData);
  }, [orginalData]);

  const onDateChangeFrom = useCallback((date: Date | null) => {
    if (date) {
      const dateFormat = new Date(date);
      setValueFrom(dateFormat);
      changeArr(dateFormat, valueTo)
    }
  }, [changeArr, valueTo]);

  const onDateChangeTo = useCallback((date: Date | null) => {
    if (date) {
      const dateFormat = new Date(date);
      setValueTo(dateFormat);
      changeArr(valueFrom, dateFormat)
    }
  }, [changeArr, valueFrom]);

  useEffect(() => {
    const workTimeExtraHours = calculateExtraHours(resData);
    setExtraHours(workTimeExtraHours);
    if (resData.length && resData) {
        const from = resData[resData.length - 1][0].split(" ")[0];
        const to = resData[0][0].split(" ")[0];
        setDateRange(`${from} do ${to}`)
        setShowTime(true);
      }
   }, [resData])

  return (
    <div className="flex flex-col justify-center items-center w-100" style={{ gap: '1rem'}}>
      <CSVSelector onChange={(_data) => setData(_data)} />
      {showTime && <section style={{ textAlign: 'center'}}>
          <p>
            Łącznie nadgodzin:
            <strong style={{ color: '#dc3545' }}>
              {extraHours}
            </strong>
        </p>
        <p>
          Zakres dat: <strong style={{ color: '#dc3545' }}>{dateRange}</strong>
        </p>
        </section>
      }
      {
        showTime && <section style={{ display: 'flex', gap: '1rem' }}>

          <section className="flex justify-center items-center" style={{ gap: '1rem'}}>
            <span>Od daty:</span>
            <SelectDatepicker
              selectedDate={valueFrom}
              onDateChange={onDateChangeFrom}
               labels={{
                  dayLabel: 'Dzień',
                  dayPlaceholder: 'Dzień',
                  monthLabel: 'Miesiąc',
                  monthPlaceholder: 'Miesiąc',
                  months: {
                    '1': 'Styczeń',
                    '2': 'Luty',
                    '3': 'Marzec',
                    '4': 'Kwiecień',
                    '5': 'Maj',
                    '6': 'Czerwiec',
                    '7': 'Lipiec',
                    '8': 'Sierpień',
                    '9': 'Wrzesień',
                    '10': 'Październik',
                    '11': 'Listopad',
                    '12': 'Grudzień'
                  },
                  yearLabel: 'Rok',
                  yearPlaceholder: 'Rok'
                }}
            />
          </section>
          
          <section className="flex justify-center items-center" style={{ gap: '1rem'}}>
            <span>Do daty:</span>
            <SelectDatepicker
              selectedDate={valueTo}
              onDateChange={onDateChangeTo}
              labels={{
                  dayLabel: 'Dzień',
                  dayPlaceholder: 'Dzień',
                  monthLabel: 'Miesiąc',
                  monthPlaceholder: 'Miesiąc',
                  months: {
                    '1': 'Styczeń',
                    '2': 'Luty',
                    '3': 'Marzec',
                    '4': 'Kwiecień',
                    '5': 'Maj',
                    '6': 'Czerwiec',
                    '7': 'Lipiec',
                    '8': 'Sierpień',
                    '9': 'Wrzesień',
                    '10': 'Październik',
                    '11': 'Listopad',
                    '12': 'Grudzień'
                  },
                  yearLabel: 'Rok',
                  yearPlaceholder: 'Rok'
                }}
            />
          </section>
        </section>
      }
      {data.length !== 0 && <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead>
          <tr>
          {resDataTitle?.map(title => {
            return <th key={title} className="text-left">{title}</th>
          })}
            </tr>
        </thead>
        <tbody>
          {resData?.map((rowData, i) => {
            return (
              <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                {rowData?.map((data, j) => {
                  if (j === 0) {
                    const date = new Date(data)
                    let formatedDate: React.ReactNode = date.toLocaleDateString('pl-PL', options);
                    if(formatedDate && typeof formatedDate === 'string' && formatedDate.includes("00:00:00")) {
                        formatedDate = <span style={{ fontWeight: 'bold', color: '#dc3545' }}>Brak danych {formatedDate.replace(" 00:00:00", "")}</span>;
                    }
                    return <td key={j}>{ formatedDate }</td>
                  }
                  return <td key={j}>{data}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>}
    </div>
  );
};

export default CSVReader;