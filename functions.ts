export const uniqueFilter = (value: any, index: number, array: any[]) => {
    return array.indexOf(value) === index;
}
export const zip = (...objs: Array<any>[]) => {
    if (!objs.every((array) => array.length == objs[0].length)) {
      throw Error("All provided arrays must have same length");
    }
    return new Array(objs[0].length).fill(null).map((none, index) => {
      return objs.map((array) => array[index]);
    });
  };

// Image Utils 
import html2canvas from "html2canvas";
import React, { ReactNode, isValidElement } from "react";
import ReactDOM from "react-dom/client";

export const takePictureFromEl = async (el: HTMLElement | Element, openNewTabForForDebug: boolean = false) => {
    let canvas = await html2canvas(el as HTMLElement, { backgroundColor: null });
    let url = canvas.toDataURL('image/png');
    if (openNewTabForForDebug) {
        let win = window.open("");
        win?.document.write(`
            <html>
                <head>
                    <title>Snapshot of element</title>
                </head>
                <body>
                    <img src="${url}" />
                </body>
            </html>
        `);
    }
    return url;
}

export interface CaptureElementImage {
    el: HTMLElement | Element | ReactNode | string;
    width?: number;
    height?: number;
    aditionalCss?: string;
    beforeScreenshot?: Function;
}

export const captureElementImage = async ({
    el,
    width,
    height,
    aditionalCss,
    beforeScreenshot,
}: CaptureElementImage = {
        el: null,
        width: 650,
        height: 400,
    }) => {
    if (el == undefined) {
        throw Error("Parameter 'el' is required.");
    }
    let workspaceId = `report-exporting-workspace-area-${window.crypto.randomUUID()}`;
    let workspaceEl = document.createElement('div');
    let style = document.createElement('style');

    workspaceEl.id = workspaceId;
    document.body.appendChild(workspaceEl);
    workspaceEl.style.position = 'absolute';
    workspaceEl.style.top = '0';
    workspaceEl.style.left = '500%';
    if (width) {
        workspaceEl.style.width = `${width}px`;
    }
    if (height) {
        workspaceEl.style.height = `${height}px`;
    }
    if (aditionalCss) {
        style.innerHTML = aditionalCss!.replaceAll(/(?:([^{}\n;:]+,?)\s+)(?!;)/g, `#${workspaceId} $1`);
        document.body.appendChild(style);
    }
    if (isValidElement(el)) {
        let workspace = ReactDOM.createRoot(workspaceEl);
        workspace.render(el);
    } else {
        let html = "";
        if (el instanceof HTMLElement || el instanceof Element) {
            html = el.outerHTML;
        } else {
            html = el as string;
        }
        workspaceEl.insertAdjacentHTML('beforeend', html);
    }
    if (beforeScreenshot) {
        await beforeScreenshot(workspaceEl);
    }
    let data = takePictureFromEl(workspaceEl.children[0]);
    document.body.removeChild(workspaceEl);
    if (aditionalCss) {
        document.body.removeChild(style);
    }
    return data;
}

// Date
export const dateToDDMMYYYY = (date: Date, sep: string = "/") => {
    return `${(date.getDate()).toString().padStart(2, "0")}${sep}${(date.getMonth() + 1).toString().padStart(2, "0")}${sep}${date.getFullYear()}`;
  };
  
  export const dateToYYYYMMDD = (date: Date, sep: string = "-") => {
    return `${date.getFullYear()}${sep}${(date.getMonth() + 1).toString().padStart(2, "0")}${sep}${(date.getDate()).toString().padStart(2, "0")}`;
  };
  
  export const dateToYYYYMM = (date: Date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
  };
  
  export const YYYYMMToDate = (input: string) => {
    return new Date(parseInt(input.slice(0, 4)), parseInt(input.slice(5, 7)) - 1);
  }
  
  export const YYYYMMDDToDate = (input: string) => {
    // this time constant is just a trick to get rid from any timezone problem between
    // our zone (-04:00) and Brazilian timezone (-03:00) as our database has still has some errors
    // in due to development
    return new Date(input + "T09:00:00");
  };
  export const lastNMonthsChartLabels = (n = 12, abbr = true, from: number | undefined = undefined) => {
    from = from || new Date().getMonth();
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    let result: string[] = [];
    while ((n - result.length) > 0) {
      result = monthNames.slice(max([0, from - (n - result.length)]), from).concat(result);
      from = 12;
    }
    if (abbr) {
      return result.map((month) => month.slice(0, 1).toUpperCase() + month.slice(1, 3));
    }
    return result;
  };
  
  // TIME SERIES
  type GetTimestampFromItem = (item: any) => number;
  type CreateItemFromDate = (item: Date) => any;
  export enum TimeSeriesNormalizerInterval {
    monthly,
    daily,
  }
  
  export const normalizeTimeSeries = <T>(
    interval: TimeSeriesNormalizerInterval,
    getDateFromItem: GetTimestampFromItem,
    createItemFromDate: CreateItemFromDate,
    ...objs: Array<T>[]) => {
    if (objs.length == 1) {
      return objs;
    }
    const { minDate, maxDate } = getMinMaxDatesFromSeries(getDateFromItem, ...objs);
  
    let result = new Array(objs.length).fill(undefined).map((none) => [] as any[]);
    let currentDate = minDate;
    const miliSecondsInADay = 60 * 60 * 24 * 1000;
    let serieIndex: number = 0;
    while (currentDate <= maxDate) {
      for (let index = 0; index < objs.length; index++) {
        let newItem = objs[index].find((item: any) => {
          // this division and ceil is for ignoring the possible hours between dates
          return ceil(getDateFromItem(item) / miliSecondsInADay) == ceil(currentDate.getTime() / miliSecondsInADay);
        });
        newItem = newItem || createItemFromDate(currentDate);
  
        // Fill nulls with last value :begin
        if ((newItem as any).value == null) {
          (newItem as any).value = result[index].length > 0 ? 
              result[index][result[index].length -1].value : null;
        }
        // Fill nulls with last value :end
  
        result[index].push(newItem);
      }
      // when it passes bounds of month index, the object constructors creates a new date
      // in first month of next year
      switch (interval) {
        case TimeSeriesNormalizerInterval.monthly:
          currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
          break;
        case TimeSeriesNormalizerInterval.daily:
          currentDate = new Date(
            currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1,
          );
          break;
        default:
          throw Error(`Time series normalizer interval not supported. Given: '${interval}'`);
      }
      serieIndex++;
    }
    return result as Array<Array<any | T>>;
  };
  
  export const getMinMaxDatesFromSeries = (getDateFromItem: GetTimestampFromItem, ...objs: Array<any>[]) => {
    const minDate = new Date(
      min(
        objs.map((arr: any[]) => {
          return arr.map(
            getDateFromItem,
          );
        }).reduce((a, b) => a.concat(b), []),
      )!,
    );
    const maxDate = new Date(
      max(
        objs.map((arr: any[]) => {
          return arr.map(getDateFromItem);
        }).reduce((a, b) => a.concat(b), []),
      )!,
    );
    return {
      minDate: minDate,
      maxDate: maxDate,
    };
  };
  