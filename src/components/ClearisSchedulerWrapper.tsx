import Scheduler, {SchedulerDataConfig, SummaryPos} from "react-big-scheduler-stch";

export const defaultConfig: SchedulerDataConfig = {
    schedulerWidth: '100%',
    besidesWidth: 20,
    schedulerMaxHeight: 0,
    tableHeaderHeight: 40,
    schedulerContentHeight: '500px',

    responsiveByParent: false,

    agendaResourceTableWidth: 160,
    agendaMaxEventWidth: 100,

    dayResourceTableWidth: 160,
    weekResourceTableWidth: '16%',
    monthResourceTableWidth: 160,
    quarterResourceTableWidth: 160,
    yearResourceTableWidth: 160,
    customResourceTableWidth: 160,

    dayCellWidth: 30,
    weekCellWidth: '12%',
    monthCellWidth: 80,
    quarterCellWidth: 80,
    yearCellWidth: 80,
    customCellWidth: 80,

    dayMaxEvents: 1000,
    weekMaxEvents: 1000,
    monthMaxEvents: 1000,
    quarterMaxEvents: 1000,
    yearMaxEvents: 1000,
    customMaxEvents: 1000,

    eventItemPopoverTrigger: 'hover',
    eventItemPopoverPlacement: 'bottomLeft',
    eventItemPopoverWidth: 300,

    eventItemHeight: 22,
    eventItemLineHeight: 24,
    nonAgendaSlotMinHeight: 0,
    dayStartFrom: 0,
    dayStopTo: 23,
    defaultEventBgColor: '#80C5F6',
    selectedAreaColor: '#7EC2F3',
    nonWorkingTimeHeadColor: '#999999',
    nonWorkingTimeHeadBgColor: '#fff0f6',
    nonWorkingTimeBodyBgColor: '#fff0f6',
    summaryColor: '#666',
    summaryPos: SummaryPos.TopRight,
    groupOnlySlotColor: '#F8F8F8',

    startResizable: true,
    endResizable: true,
    movable: true,
    creatable: true,
    crossResourceMove: true,
    checkConflict: false,
    eventItemPopoverEnabled: true,
    calendarPopoverEnabled: true,
    recurringEventsEnabled: true,
    viewChangeSpinEnabled: true,
    dateChangeSpinEnabled: true,
    headerEnabled: true,
    resourceViewEnabled: true,
    displayWeekend: true,
    relativeMove: true,
    defaultExpanded: true,
    dragAndDropEnabled: false,

    schedulerHeaderEventsFuncsTimeoutMs: 100,

    resourceName: 'Resource Name',
    taskName: 'Task Name',
    agendaViewHeader: 'Agenda',
    addMorePopoverHeaderFormat: 'MMM D, YYYY dddd',
    eventItemPopoverDateFormat: 'MMM D',
    nonAgendaDayCellHeaderFormat: 'ha',
    nonAgendaOtherCellHeaderFormat: 'ddd M/D',

    minuteStep: 30,

    views: [

    ],
};



// @ts-ignore

export default Scheduler.default as Scheduler.prototype
