import React from "react";
import {
  isWhichMonthWhichWeek,
  isWhichWeekWhichDay,
  isWhichYearWhichMonth,
  weeksInThisMonth,
} from "utils/date.util";
import { ordinalSuffixOf } from "utils/string.util";
const useFilterFileByDate = ({ options, files }) => {
  const weekly = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const yearly = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const data = React.useMemo(() => {
    switch (options) {
      case "weekly": {
        const result: any[] = weekly.map(() => []);
        files.data.forEach((file) => {
          weekly.forEach((_, index) => {
            if (isWhichWeekWhichDay(file.createdAt, 0, index)) {
              result[index].push(file);
            }
          });
        });
        return {
          labels: weekly,
          data: result.map((data) =>
            data.reduce(
              (accumulator, currentValue) =>
                accumulator + Number(currentValue?.size || 0),
              0,
            ),
          ),
        };
      }
      case "monthly": {
        const weekNumber = weeksInThisMonth();
        const result: any = Array.from({ length: weekNumber }).map(() => []);
        const monthly = Array.from({ length: weekNumber }).map(
          (_, index) => `${ordinalSuffixOf(index + 1)} week`,
        );
        files.data.forEach((file) => {
          monthly.forEach((_, index) => {
            if (isWhichMonthWhichWeek(file.createdAt, 0, index)) {
              result[index].push(file);
            }
          });
        });
        return {
          labels: monthly,
          data: result.map((data) =>
            data.reduce(
              (accumulator, currentValue) =>
                accumulator + Number(currentValue?.size || 0),
              0,
            ),
          ),
        };
      }
      case "yearly": {
        const result: any[] = yearly.map(() => []);
        files.data.forEach((file) => {
          yearly.forEach((_, index) => {
            if (isWhichYearWhichMonth(file.createdAt, 0, index)) {
              result[index].push(file);
            }
          });
        });
        return {
          labels: yearly,
          data: result.map((data) =>
            data.reduce(
              (accumulator, currentValue) =>
                accumulator + Number(currentValue?.size || 0),
              0,
            ),
          ),
        };
      }
      default:
        return;
    }
  }, [options, files]);

  return data;
};

export default useFilterFileByDate;
