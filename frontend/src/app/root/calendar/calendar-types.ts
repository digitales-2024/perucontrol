export type CalendarProps = {
  events: Array<CalendarEvent>
  setEvents: (events: Array<CalendarEvent>) => void
  mode: Mode
  setMode: (mode: Mode) => void
  date: Date
  setDate: (date: Date) => void
  calendarIconIsToday?: boolean
}

export type CalendarContextType = CalendarProps & {
  newEventDialogOpen: boolean
  setNewEventDialogOpen: (open: boolean) => void
  manageEventDialogOpen: boolean
  setManageEventDialogOpen: (open: boolean) => void
  selectedEvent: CalendarEvent | null
  setSelectedEvent: (event: CalendarEvent | null) => void
}
export type CalendarEvent = {
  id: string
  projectId: string,
  title: string
  color: string
  borderColor: string
  bgColor: string
  start: Date
  end: Date
}

export const calendarModes = ["semana", "mes"] as const;
export type Mode = (typeof calendarModes)[number]
