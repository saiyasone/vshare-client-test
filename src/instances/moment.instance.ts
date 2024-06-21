import moment from "moment";

moment.updateLocale("en", {
  week: {
    dow: 1,
  },
});

export default moment;
