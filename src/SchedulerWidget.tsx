import React, {Component, createElement, CSSProperties, ReactNode} from "react";
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'

import {SchedulerWidgetContainerProps} from "../typings/SchedulerWidgetProps";

import "./ui/SchedulerWidget.css";
import {
    CellUnit,
    DATE_FORMAT, ResourceEvent,
    SchedulerData,
    SchedulerDataConfig,
    SchedulerProps,
    View,
    ViewType
} from "react-big-scheduler-stch";
import ClearisSchedulerWrapper, {defaultConfig} from "./components/ClearisSchedulerWrapper";
import {Util} from "./util/Util";
import ClearisEventType = Util.ClearisEventType;
import {ListReferenceValue} from "mendix";
import classNames from "classnames";
import MxObject = mendix.lib.MxObject;
import dayjs, {Dayjs} from "dayjs";

// const resourceTableWidth = 200

export class SchedulerWidget extends Component<SchedulerWidgetContainerProps, { viewModel: SchedulerData }> {
    private _insertedRowStore: Element | null = null;
    private _thead: Element | null = null;
    private _body: Element | null = null;

    scroll = (x: number) => {
        if (this._thead) {
            this._thead.scrollLeft = x
        }
        if (this._body) {
            this._body.scrollLeft = x;
        }
    }
    get_scroll = () => {
        return this._thead!.scrollLeft
    }
    private config: SchedulerDataConfig = {
        ...defaultConfig,

        // dayResourceTableWidth: resourceTableWidth,
        // weekResourceTableWidth: resourceTableWidth,
        // monthResourceTableWidth: resourceTableWidth,
        // quarterResourceTableWidth: resourceTableWidth,
        // yearResourceTableWidth: resourceTableWidth,
        customResourceTableWidth: "auto",
        tableHeaderHeight: 80,


        schedulerContentHeight: "calc(100%- 130px)",
        eventItemLineHeight: 50,
        eventItemHeight: 50,

        calendarPopoverEnabled: false,
        eventItemPopoverEnabled: false,
        // @ts-ignore
        scrollToSpecialDayjsEnabled: false,

        viewChangeSpinEnabled: false,
        dateChangeSpinEnabled: false,

        endResizable: true,
        startResizable: true,

        dragAndDropEnabled: true,
        resourceName: "Resources",

        views: [
            {viewName: 'Day', viewType: ViewType.Custom, showAgenda: false, isEventPerspective: false},
            // {viewName: 'Quarter', viewType: ViewType.Quarter, showAgenda: false, isEventPerspective: false},
            // {viewName: 'Year', viewType: ViewType.Year, showAgenda: false, isEventPerspective: false},
        ],


    };

    schedulerData(): SchedulerData {
        return this.state.viewModel;
    }


    constructor(props: Readonly<SchedulerWidgetContainerProps> | SchedulerWidgetContainerProps) {
        super(props);


        this.prevClick.bind(this);
        this.nextClick.bind(this);
        this.onSelectDate.bind(this);
        this.onViewChange.bind(this);
        this.updateEventStart.bind(this);
        this.updateEventEnd.bind(this);

        let schedulerData =

            new SchedulerData(dayjs().startOf("month").format(DATE_FORMAT), ViewType.Custom, false, false, this.config, {
                getCustomDateFunc: this.getCustomDate, getScrollSpecialDayjs: this.getScrollSpecialDayjs
            });

        schedulerData.localeDayjs(schedulerData.localeDayjs().startOf("month")).locale("en")
        this.state = {viewModel: schedulerData}

    }

    componentDidMount() {

    }

    componentWillUnmount() {
    }

    componentDidUpdate(_prevProps: Readonly<SchedulerWidgetContainerProps>, _prevState: Readonly<{}>, _snapshot?: any) {
        function idPropIsValid(id_unchecked: unknown): asserts id_unchecked is Util.ID_Attribute_Type | ListReferenceValue {
            if (typeof id_unchecked === "undefined") throw new Error("ID attribute is invalid")
        }

        let resource_id_unchecked: Util.ID_Attribute_Type | ListReferenceValue | undefined = this.props.event_resource_id_attribute ?? this.props.event_resource_id_association;
        idPropIsValid(resource_id_unchecked)
        let resource_id_property: Util.ID_Attribute_Type | ListReferenceValue = resource_id_unchecked;

        if (this.props.resource_datasource.items != undefined && this.props.resource_datasource.items.length > 0) {
            this.schedulerData().setResources(Util.createSchedulerResources(this.props.resource_datasource.items, this.props.resource_id_attribute, this.props.resource_title_attribute))
        }

        if (this.props.event_datasource.items != undefined && this.props.event_datasource.items.length > 0) {
            this.schedulerData().setEvents(Util.createSchedulerEvents(
                    this.props.event_datasource.items,
                    {
                        idAttribute: this.props.event_id_attribute,
                        resource_id_property: resource_id_property,
                        titleAttribute: this.props.event_name_attribute,
                        descriptionAttribute: this.props.event_description_attribute,
                        startAttribute: this.props.event_start_attribute,
                        endAttribute: this.props.event_end_attribute,
                        classAttribute: this.props.event_class_attribute,
                        timeIsEditable: this.props.event_can_change_time,
                        resourceIsEditable: this.props.event_can_change_resource,
                        imageAttribute: this.props.event_image
                    }
                )
            )
        }
    }

    render(): ReactNode {
        if (this._insertedRowStore) {
            this._insertedRowStore.innerHTML = '';
        }

        return <div className={"flexFullWindow"} style={{flexGrow: 1, position: "relative"}}>
            <DndProvider backend={HTML5Backend}>
                <ClearisSchedulerWrapper {...this.getSchedulerProps()}/>
            </DndProvider>
        </div>;
    }

    getSchedulerProps(): SchedulerProps {
        return {
            schedulerData: this.schedulerData(),
            prevClick: this.prevClick,
            nextClick: this.nextClick,
            onSelectDate: this.onSelectDate,
            onViewChange: this.onViewChange,
            eventItemTemplateResolver: this.eventItemTemplateResolver,
            nonAgendaCellHeaderTemplateResolver: this.nonAgendaCellHeaderTemplateResolver,
            updateEventStart: this.updateEventStart,
            updateEventEnd: this.updateEventEnd,
            moveEvent: this.moveEvent,
            slotItemTemplateResolver: this.slotTemplateResolver,
            onScrollLeft: this.onScrollLeft,
            onScrollRight: this.onScrollRight


        }
    }

    private updateContextStartEnd(_schedulerData: SchedulerData) {

        this.props.VisibleDateStartDate.setValue(_schedulerData.getViewStartDate().toDate());
        this.props.VisibleDateEndDate.setValue(_schedulerData.getViewEndDate().toDate());
        this.props.on_context_change?.execute();
    }

    prevClick = (schedulerData: SchedulerData): void => {
        schedulerData.prev()
        this.updateContextStartEnd(schedulerData);
        this.setState({viewModel: schedulerData})
    }

    nextClick = (schedulerData: SchedulerData): void => {
        schedulerData.next();
        this.updateContextStartEnd(schedulerData)
        this.setState({viewModel: schedulerData});
    }

    onSelectDate = (_schedulerData: SchedulerData, _date: string): void => {
        this.setState({
            viewModel: _schedulerData
        })
    }

    onViewChange = (schedulerData: SchedulerData, view: View): void => {
        schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
        // this.updateContextStartEnd(schedulerData)
        this.setState({viewModel: schedulerData});
    }

    slotTemplateResolver = (
        _schedulerData: SchedulerData,
        _slot: ResourceEvent, _slotClickedFunc: (schedulerData: SchedulerData, slot: ResourceEvent) => void,
        _width: number,
        _clsName: string
    ) => {
        // @ts-ignore
        const slot = _slot as { slotName: string, slotId: string }
        return <div className="resource-item" onClick={() => {
            this.resourceOnClick(this.schedulerData().getResourceById(slot.slotId))
        }
        }>
            <div className="resource-item__content">
                <div className="resource-item__name">{slot.slotName}</div>
                <div className="resource-item__disciplines"></div>
            </div>
        </div>
    }
    eventItemTemplateResolver = (
        _schedulerData: SchedulerData,
        event: ClearisEventType,
        _bgColor: string,
        _isStart: boolean,
        _isEnd: boolean,
        mustAddCssClass: string,
        mustBeHeight: number,
        agendaMaxEventWidth: number) => {


        let forcedStyle = {height: mustBeHeight};
        if (!!agendaMaxEventWidth) { // @ts-ignore
            forcedStyle = {...forcedStyle, maxWidth: agendaMaxEventWidth};
        }


        return <div key={event.id}
                    className={classNames(mustAddCssClass, event.cssClass)} style={forcedStyle}
                    onDoubleClick={() => {
                        this.eventItemClick(_schedulerData, event)
                    }
                    }>
            <div className={"event-item__content"} style={{marginLeft: '4px', lineHeight: `${mustBeHeight}px`}}>
                <div className="event-item__images">
                    {
                        event.imageBase64 ? <img src={`data:image/png;base64, ${event.imageBase64}`}/> : null
                    }
                </div>
                <div className={"event-item__wrapper"}>
                    <div className="event-item__title">{event.title}</div>
                    <div className="event-item__description">{event.description}</div>
                </div>
            </div>
        </div>;
    }

    private nonAgendaCellHeaderTemplateResolver = (schedulerData: SchedulerData, item: { time: string, nonWorkingTime: boolean }, _formattedDateItems: string[], style: CSSProperties) => {
        let datetime = schedulerData.localeDayjs(item.time);
        let isCurrentDate = false;

        if (schedulerData.viewType === ViewType.Day) {
            isCurrentDate = datetime.isSame(new Date(), 'hour');
        } else {
            isCurrentDate = datetime.isSame(new Date(), 'day');
        }

        if (isCurrentDate) {
            style.backgroundColor = '#118dea';
            style.color = 'white';
        }

        return [

            <th ref={(e) => {
                if (datetime.date() == 1) {

                    this.pushRefToHeaderRefs(e, datetime)
                }
            }
            } key={item.time} className={`header3-text dateHeader`} style={style}>
                <div className={"date"}>
                    {datetime.format("DD")}
                </div>
                <div className={"day"}>
                    {datetime.format("ddd")}
                </div>
            </th>

        ];
    }
    createDraggableScroll = () => {
        const ele = this._insertedRowStore?.parentElement?.parentElement?.parentElement?.parentElement
        const nextElem = ele?.parentElement?.nextElementSibling

        const bind_scroll = this.scroll;
        if (ele && nextElem) {
            this._thead = ele;
            this._body = nextElem;

            let pos = {top: 0, left: 0, x: 0, y: 0};

            const mouseDownHandler = function (e: MouseEvent) {
                ele.style.cursor = 'grabbing';
                ele.style.userSelect = 'none';

                pos = {
                    left: ele.scrollLeft,
                    top: ele.scrollTop,
                    // Get the current mouse position
                    x: e.clientX,
                    y: e.clientY,
                };

                document.addEventListener('mousemove', mouseMoveHandler);
                document.addEventListener('mouseup', mouseUpHandler);
            };

            const mouseMoveHandler = function (e: MouseEvent) {
                // How far the mouse has been moved
                const dx = e.clientX - pos.x;
                bind_scroll(pos.left - dx)
            };

            const mouseUpHandler = function () {
                ele.style.cursor = 'grab';
                ele.style.removeProperty('user-select');

                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
            };
            ele.addEventListener('mousedown', mouseDownHandler);
        }
    }
    pushRefToHeaderRefs = (elem: HTMLTableCellElement | null, date: Dayjs) => {


        if (elem) {
            const row = elem.parentElement;
            const thead = row!.parentElement;
            let insertRow: HTMLElement | null = null;
            const key = date.format("DD/MM/YYYY");
            const content = date.format("MMMM YYYY");

            if (thead && row) {
                if (thead.children.length == 1) {
                    insertRow = document.createElement('tr');
                    thead.insertBefore(insertRow, row!);
                } else {
                    insertRow = thead!.childNodes[0] as HTMLElement
                    row.style.height = "60px"
                }
                ;
                if (insertRow != this._insertedRowStore) {

                    this._insertedRowStore = insertRow
                    this.createDraggableScroll()

                }


                let element = insertRow.querySelector(`[date-index='${key}']`);
                if (!element) {
                    var tablehead = document.createElement('th');

                    tablehead.setAttribute('colspan', date.daysInMonth().toString());
                    tablehead.setAttribute('date-index', key);
                    tablehead.innerText = content;
                    insertRow.appendChild(tablehead);
                }
            }
        }
    }

    moveEvent = async (schedulerData: SchedulerData, event: ClearisEventType, slotId: string, slotName: string, _start: string, _end: string) => {
        let filter = ((schedulerData as any).events as Array<ClearisEventType>).filter(x => x.id === event.id)[0];
        schedulerData.moveEvent(filter, slotId, slotName, event.start, event.end);

        const mxobj = await this.resolve_mxObj(event);


        mxobj.set(this.props.eventresourceIDAttribute, slotId)
        if (this.props.eventresourceAssociation) {
            let resourceById = schedulerData.getResourceById(slotId) as any;
            mxobj.set(this.props.eventresourceAssociation, resourceById.mxItem.id)
        }

        if(event.resizable) {
            mxobj.set(this.props.startAttribute, dayjs(_start, DATE_FORMAT).startOf("day").unix() * 1000)
            mxobj.set(this.props.endAttribute, dayjs(_end, DATE_FORMAT).endOf("day").unix() * 1000)
        }
        const old_scroll = this.get_scroll();

        mx.data.commit({
            mxobj: mxobj, callback: () => {
                this.setState({viewModel: schedulerData}, () => {
                    this.scroll(old_scroll)

                });

            }
        })
    }

    updateEventStart = async (schedulerData: SchedulerData, event: ClearisEventType, start: string) => {

        let filter = ((schedulerData as any).events as Array<ClearisEventType>).filter(x => x.id === event.id)[0];

        schedulerData.updateEventStart(filter, start);


        const mxobj = await this.resolve_mxObj(event);

        mxobj.set(this.props.startAttribute, dayjs(start, DATE_FORMAT).startOf("day").unix() * 1000)

        const old_scroll = this.get_scroll();

        mx.data.commit({
            mxobj: mxobj, callback: () => {

                this.setState({viewModel: schedulerData}, () => {
                    this.scroll(old_scroll)

                });

            }
        })

    }
    updateEventEnd = async (schedulerData: SchedulerData, event: ClearisEventType, newEnd: string) => {

        let filter = ((schedulerData as any).events as Array<ClearisEventType>).filter(x => x.id === event.id);

        schedulerData.updateEventEnd(filter[0], newEnd);
        const mxobj = await this.resolve_mxObj(event);

        mxobj.set(this.props.endAttribute, dayjs(newEnd, DATE_FORMAT).endOf("day").unix() * 1000)

        const old_scroll = this.get_scroll();

        mx.data.commit({
            mxobj: mxobj, callback: () => {
                this.setState({viewModel: schedulerData}, () => {
                    this.scroll(old_scroll)

                });

            }
        })

    }

    resolve_mxObj(event: ClearisEventType): Promise<MxObject> {
        return new Promise(function (resolve, reject) {
            if (event.mxObj) {
                resolve(event.mxObj)
            } else {
                mx.data.get({
                        guids: [event.mxGuid],
                        callback: function (obj) {
                            event.mxObj = obj[0];
                            resolve(obj[0]);
                        },
                        error: function (e) {
                            reject(e);
                        }
                    }
                );

            }
        });
    }

    eventItemClick = (_schedulerData: SchedulerData, event: ClearisEventType) => {
        this.props.event_onclick_action?.get(event.mxItem).execute();
    }

    resourceOnClick = (_resource: any) => {

        this.props.resource_onclick_action?.get(_resource.mxItem).execute()
    }

    onScrollLeft = (_schedulerData: SchedulerData, _schedulerContent: React.ReactNode & Element, _maxScrollLeft: number) => {

        function sleep(ms: number) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        sleep(100).then(() => {
            if (_schedulerContent) {
                _schedulerData.prev();
                this.updateContextStartEnd(_schedulerData)

                this.scroll(this._insertedRowStore?.firstElementChild?.getBoundingClientRect().width ?? _schedulerContent.getBoundingClientRect().width)
            }
        })
    }

    onScrollRight = (_schedulerData: SchedulerData, _schedulerContent: React.ReactNode & Element, _maxScrollLeft: number) => {

        function sleep(ms: number) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        sleep(100).then(() => {
            if (_schedulerContent) {
                _schedulerData.next();
                this.updateContextStartEnd(_schedulerData)
                this.scroll(_schedulerContent.scrollWidth - this._insertedRowStore!.lastElementChild!.clientWidth - _schedulerContent.clientWidth)
            }
        })
    }

    getCustomDate = (
        schedulerData: SchedulerData & { endDate: Dayjs },
        num: number,
        date?: Dayjs,
    ): { startDate: Dayjs; endDate: Dayjs; cellUnit: CellUnit } => {


        // @ts-ignore
        let selectDate: Dayjs = typeof schedulerData.startDate == "string" ? new Dayjs(schedulerData.startDate) : schedulerData.startDate as Dayjs;
        if (date != undefined)
            selectDate = date;

        let startDate: Dayjs = schedulerData.localeDayjs(selectDate).startOf("month").subtract(1, "month")
        let endDate = schedulerData.localeDayjs(selectDate).endOf("month").add(1, "month")
        let cellUnit = CellUnit.Day;

        //view to right
        if (num === 1) {
            startDate = (typeof schedulerData.startDate == "string" ? new Dayjs(schedulerData.startDate) : schedulerData.startDate as Dayjs).add(1, "month");
            endDate = schedulerData.localeDayjs(schedulerData.endDate).endOf("month").add(1, 'month');

        }
        //view to left
        else if (num === -1) {
            startDate = schedulerData.localeDayjs(schedulerData.startDate).subtract(1, 'month');
            endDate = schedulerData.localeDayjs(schedulerData.endDate).subtract(1, "month");
        }

        return {
            startDate,
            endDate,
            cellUnit
        };
    }

    getScrollSpecialDayjs = (_schedulerData: SchedulerData, _startDayjs: Dayjs, _endDays: Dayjs): Dayjs => {
        // @ts-ignore
        return dayjs()
        // return null;

    }
}
