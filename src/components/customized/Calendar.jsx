import googleCalendarPlugin from '@fullcalendar/google-calendar'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'

const GOOGLE_CALENDAR_ID = import.meta.env.PUBLIC_GOOGLE_CALENDAR_ID
const GOOGLE_CALENDAR_APIKEY = import.meta.env.PUBLIC_GOOGLE_CALENDAR_APIKEY
const events = {
  googleCalendarId: GOOGLE_CALENDAR_ID,
}
const headerToolbar = {
  left: 'prev,next',
  center: 'title',
  right: 'timeGridWeek,timeGridDay', // user can switch between the two
}

export default function Calendar() {
  return (
    <FullCalendar
      plugins={[timeGridPlugin, googleCalendarPlugin]}
      initialView='timeGridWeek'
      weekends={true}
      events={events}
      eventContent={renderEventContent}
      googleCalendarApiKey={GOOGLE_CALENDAR_APIKEY}
      height='80vh'
      headerToolbar={headerToolbar}
      eventClick={arg => arg.jsEvent.preventDefault()}
    />
  )
}

// a custom render function
function renderEventContent(eventInfo) {
  const title = eventInfo.event.title
  return (
    <div className='fc-event-main-frame'>
      <div className='fc-event-time'>{eventInfo.timeText}</div>
      <div className='fc-event-title fc-sticky'>
        {title === 'undefined' ? 'Unavailable' : title}
      </div>
    </div>
  )
}
