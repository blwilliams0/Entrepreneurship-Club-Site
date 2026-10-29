/*
  MEETING SCHEDULE: the only file officers need to edit for meeting info.

  The site works out the next meeting by itself (Pacific time) and shows it
  on the home page, the Build Something page, and the footer. A meeting
  stops being "next" once its end time passes.

  To skip a week:      add its date to `skipDates` ("YYYY-MM-DD").
  To extend the term:  change `endDate`.
  To add a topic:      add a line to `topics`, e.g. "2026-11-11": "Crazy 8s workshop".
  To announce a one-off meeting (or override the schedule entirely):
                       fill in `nextMeeting` below. When `date` is filled in,
                       it wins over the schedule. Clear it again afterwards.
*/
window.CLUB_SITE = {
  schedule: {
    weekday: 3,                 // 0 = Sunday ... 3 = Wednesday ... 6 = Saturday
    startTime: "14:00",         // 24-hour clock, shown as 2:00 PM
    endTime: "15:00",
    location: "OSU Room 210",
    startDate: "2026-10-28",
    endDate: "2026-12-09",      // last day a meeting can happen
    skipDates: [
      "2026-11-25"              // Wednesday before Thanksgiving: no meeting
    ],
    defaultTopic: ""            // shown when a date has no entry in `topics`
  },

  // Optional topic per meeting date. Leave empty to show no topic line.
  topics: {
    // "2026-11-04": "Topic goes here"
  },

  // Shown after the last scheduled meeting.
  afterScheduleMessage: "No more meetings are scheduled this term. Follow us on Instagram to hear when they resume.",

  // One-off override. Leave `date` empty to use the schedule above.
  nextMeeting: {
    date: "",
    time: "",
    location: "",
    topic: ""
  }
};
