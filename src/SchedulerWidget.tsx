import {Component, createElement, CSSProperties, ReactNode} from "react";
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'

import {SchedulerWidgetContainerProps} from "../typings/SchedulerWidgetProps";

import "./ui/SchedulerWidget.css";
import {
    CellUnit,
    DATE_FORMAT, DATETIME_FORMAT, Resource,
    ResourceEvent,
    SchedulerData,
    SchedulerDataConfig,
    SchedulerProps,
    View,
    ViewType
} from "react-big-scheduler-stch";
import ClearisSchedulerWrapper, {defaultConfig} from "./components/ClearisSchedulerWrapper";
import {Util} from "./util/Util";
import {ListReferenceValue} from "mendix";
import classNames from "classnames";
import dayjs, {Dayjs} from "dayjs";
import ClearisEventType = Util.ClearisEventType;
import MxObject = mendix.lib.MxObject;

// const resourceTableWidth = 200

export class SchedulerWidget extends Component<SchedulerWidgetContainerProps, {
    viewModel: SchedulerData,
    viewChanged: number
}> {
    private _insertedRowStore: Element | null = null;
    private _thead: Element | null = null;
    private _body: Element | null = null;

    private scrollElement: Element | null = null;

    scrollDebounce: boolean = true;
    _scrollDate?: string;

    events: ClearisEventType[] = [];
    resources: Resource[] = []


    //Scroll
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

    private scrollToDate(date: string) {
        if (this._insertedRowStore) {
            let querySelector = this._insertedRowStore.nextElementSibling?.querySelector(`[date-index='${date}']`);
            if (querySelector) {
                let elementPosition = (querySelector as HTMLElement)?.offsetLeft;
                let clientWidth = (this._body?.clientWidth ?? 0) / 2;
                if (elementPosition != undefined && clientWidth != undefined) {
                    this.scroll(elementPosition - clientWidth);
                }
            }
        }
    }


    //Schedular config
    private config: SchedulerDataConfig = {
        ...defaultConfig,


        customResourceTableWidth: "auto",
        tableHeaderHeight: 80,


        schedulerContentHeight: "calc(100%- 130px)",
        eventItemLineHeight: 50,
        eventItemHeight: 50,

        calendarPopoverEnabled: true,
        eventItemPopoverEnabled: false,

        // @ts-ignore
        scrollToSpecialDayjsEnabled: false,

        viewChangeSpinEnabled: false,
        dateChangeSpinEnabled: false,

        endResizable: true,
        startResizable: true,

        dragAndDropEnabled: true,
        resourceName: "Resources",
        checkConflict: false,
    };

    schedulerData(): SchedulerData {
        return this.state.viewModel;
    }

    getSchedulerProps(): SchedulerProps {


        let rightCustomHeader = (
            <div className={"btn mx-button mx-name-actionButton6 StartSearch btn-info"} onClick={() => {
                const __d = this.schedulerData();
                this.onSelectDate(__d, dayjs().format(DATE_FORMAT))

            }}><span> Today </span></div>
        );

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
            leftCustomHeader: rightCustomHeader,
        }
    }


    constructor(props: Readonly<SchedulerWidgetContainerProps> | SchedulerWidgetContainerProps) {
        super(props);


        this.prevClick.bind(this);
        this.nextClick.bind(this);
        this.onSelectDate.bind(this);
        this.onViewChange.bind(this);
        this.updateEventStart.bind(this);
        this.updateEventEnd.bind(this);

        let datejs = dayjs()
        let localstore = this.getLocalstore();
        if (localstore) {
            this._scrollDate = localstore.scrollDate
            datejs = dayjs(this._scrollDate, "DD/MM/YYYY")
        } else {
            this._scrollDate = datejs.format("DD/MM/YYYY")
        }

        let schedulerData =

            new SchedulerData(datejs.format(DATE_FORMAT), ViewType.Custom, false, false, this.config, {
                getCustomDateFunc: this.getCustomDate, getScrollSpecialDayjs: this.getScrollSpecialDayjs
            });

        schedulerData.setDate(datejs.format(DATE_FORMAT));

        schedulerData.setViewType(ViewType.Custom, false, false)
        schedulerData.localeDayjs(schedulerData.localeDayjs()).locale("en")
        this.state = {viewModel: schedulerData, viewChanged: 0}

    }

    //Render
    render(): ReactNode {
        if (this._insertedRowStore) {
            this._insertedRowStore.innerHTML = '';
        }


        this.schedulerData().setEvents(this.events)
        this.schedulerData().setResources(this.resources)


        return <div className={"flexFullWindow"} id={this.props.name} style={{flexGrow: 1, position: "relative"}}
                    key={this.props.name}>
            <DndProvider backend={HTML5Backend}>
                <ClearisSchedulerWrapper {...this.getSchedulerProps()}/>
            </DndProvider>
        </div>;
    }

    componentWillUnmount() {
        this.syncLocalstore()
    }

    shouldComponentUpdate(nextProps: Readonly<SchedulerWidgetContainerProps>, nextState: Readonly<{
        viewModel: SchedulerData,
        viewChanged: number,
        scrollLeftCounter: 0,
        scrollRightCounter: number
    }>): boolean {
        let update = false;
        if (this.props.event_datasource.items !== nextProps.event_datasource.items && nextProps.event_datasource.items != undefined) {

            update = true

            function idPropIsValid(id_unchecked: unknown): asserts id_unchecked is Util.ID_Attribute_Type | ListReferenceValue {
                if (typeof id_unchecked === "undefined") throw new Error("ID attribute is invalid")
            }

            let resource_id_unchecked: Util.ID_Attribute_Type | ListReferenceValue | undefined = this.props.event_resource_id_attribute ?? this.props.event_resource_id_association;
            idPropIsValid(resource_id_unchecked)
            let resource_id_property: Util.ID_Attribute_Type | ListReferenceValue = resource_id_unchecked;

            this.events = Util.createSchedulerEvents(
                nextProps.event_datasource.items,
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
            );
        }

        if (this.props.resource_datasource.items !== nextProps.resource_datasource.items && nextProps.resource_datasource.items != undefined) {
            update = true
            this.resources = Util.createSchedulerResources(nextProps.resource_datasource.items, this.props.resource_id_attribute, this.props.resource_title_attribute);
        }

        if (this.props.SuggestedViewDate.value?.getTime() !== nextProps.SuggestedViewDate.value?.getTime() && nextProps.SuggestedViewDate.value != undefined) {

            if (this._scrollDate == undefined) {

                this.onSelectDate(this.schedulerData(), dayjs(nextProps.SuggestedViewDate.value).format(DATE_FORMAT))
            }


            update = true;
        }

        if (this.state.viewChanged != nextState.viewChanged) {
            update = true;
        }
        return update
    }

    componentDidUpdate(_prevProps: Readonly<SchedulerWidgetContainerProps>, _prevState: Readonly<{}>, _snapshot?: any) {
        const callback = () => {
            if (this._scrollDate && this._thead) {
                let querySelector = this._thead.querySelector(`th[date-index='${this._scrollDate}']`);
                if (querySelector) {
                    let elementPosition = (querySelector as HTMLElement)?.offsetLeft;
                    if (elementPosition) {
                        this.scroll(elementPosition)
                    }
                }
                this._scrollDate = undefined;
            } else {

            }
        }
        setTimeout(callback, 100)
    }

    // @ts-ignore
    private getElementAtScrollStart(): { date: any; pos: number } | undefined {
        const thead = this._thead;
        let dateIndexes = thead?.querySelectorAll("th.dateHeader");
        if (dateIndexes) {
            let dateAndPos = Array.from(dateIndexes).map((d) => {
                return {
                    date: d.getAttribute("date-index"),
                    pos: (d as HTMLElement).offsetLeft
                }
            })
            return dateAndPos.find(v => v.pos >= this._thead!.scrollLeft - 40);
        }
    }


    //Update context variable.
    private updateContextStartEnd(_schedulerData: SchedulerData) {
        this.props.VisibleDateStartDate.setValue(_schedulerData.getViewStartDate().toDate());
        this.props.VisibleDateEndDate.setValue(_schedulerData.getViewEndDate().toDate());
        this.props.on_context_change?.execute();
    }


    //Callbacks
    prevClick = (schedulerData: SchedulerData): void => {

        schedulerData.prev()
        this.updateContextStartEnd(schedulerData);
        this.setState({viewChanged: this.state.viewChanged + 1})
    }

    nextClick = (schedulerData: SchedulerData): void => {
        schedulerData.next();
        this.updateContextStartEnd(schedulerData)
        this.setState({viewChanged: this.state.viewChanged + 1})
    }

    onSelectDate = (_schedulerData: SchedulerData, date: string): void => {
        this.schedulerData().setDate(date);

        this.updateContextStartEnd(this.schedulerData())
        this.setState({viewChanged: this.state.viewChanged + 1}, () => {
            let key = dayjs(date).format("DD/MM/YYYY");
            //scroll date into view!
            this.scrollToDate(key);
        })
    }

    onViewChange = (schedulerData: SchedulerData, view: View): void => {
        schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
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
    eventItemTemplateResolver = (_schedulerData: SchedulerData, event: ClearisEventType, _bgColor: string, _isStart: boolean, _isEnd: boolean, mustAddCssClass: string, mustBeHeight: number, agendaMaxEventWidth: number) => {


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

    private nonAgendaCellHeaderTemplateResolver = (schedulerData: SchedulerData, item: {
        time: string,
        nonWorkingTime: boolean
    }, _formattedDateItems: string[], style: CSSProperties) => {

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
                e?.setAttribute("date-index", datetime.format("DD/MM/YYYY"))
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

        const mxobj = await this.resolve_mxObj(event);


        mxobj.set(this.props.eventresourceIDAttribute, slotId)
        if (this.props.eventresourceAssociation) {
            let resourceById = schedulerData.getResourceById(slotId) as any;
            mxobj.set(this.props.eventresourceAssociation, resourceById.mxItem.id)
        }

        const newStart = dayjs(_start, DATE_FORMAT).startOf("day")
        const newEnd = dayjs(_end, DATE_FORMAT).endOf("day");
        if (event.resizable) {
            mxobj.set(this.props.startAttribute, newStart.unix() * 1000);
            mxobj.set(this.props.endAttribute, newEnd.unix() * 1000);
        }

        schedulerData.moveEvent(filter, slotId, slotName, (event.resizable) ? newStart.format(DATETIME_FORMAT) : event.start, (event.resizable) ? newEnd.format(DATETIME_FORMAT) : event.end);

        this.setState({viewChanged: this.state.viewChanged + 1}
        )

        mx.data.action({
            params: {
                actionname: this.props.onChangeValidation,
                guids: [mxobj.getGuid()],
                applyto: "selection"
            },
            callback: () => {

            }
        });
    }

    updateEventStart = async (schedulerData: SchedulerData, event: ClearisEventType, start: string) => {

        let filter = ((schedulerData as any).events as Array<ClearisEventType>).filter(x => x.id === event.id)[0];

        schedulerData.updateEventStart(filter, start);


        const mxobj = await this.resolve_mxObj(event);

        mxobj.set(this.props.startAttribute, dayjs(start, DATE_FORMAT).startOf("day").unix() * 1000)

        const old_scroll = this.get_scroll();

        mx.data.action({
            params: {
                actionname: this.props.onChangeValidation,
                guids: [mxobj.getGuid()],
                applyto: "selection"
            },
            callback: () => {
                this.setState({viewModel: schedulerData}, () => {
                    this.scroll(old_scroll)
                });
            }
        });


    }
    updateEventEnd = async (schedulerData: SchedulerData, event: ClearisEventType, newEnd: string) => {

        let filter = ((schedulerData as any).events as Array<ClearisEventType>).filter(x => x.id === event.id);

        schedulerData.updateEventEnd(filter[0], newEnd);
        const mxobj = await this.resolve_mxObj(event);

        mxobj.set(this.props.endAttribute, dayjs(newEnd, DATE_FORMAT).endOf("day").unix() * 1000)

        const old_scroll = this.get_scroll();


        mx.data.action({
            params: {
                actionname: this.props.onChangeValidation,
                guids: [mxobj.getGuid()],
                applyto: "selection"
            },
            callback: () => {
                this.setState({viewModel: schedulerData, viewChanged: 1 + this.state.viewChanged}, () => {
                    this.scroll(old_scroll)
                });
            }
        });


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

    private mouse_is_up: boolean = true
    private scrollPosition: number = 0
    mouseUp_callback = () => {
        this.mouse_is_up = true;
    }
    mouseDown_callback = () => {

        this.mouse_is_up = false
    }
    mouseCallbackStore: any
    private onScroll_callback = (_e: MouseEvent) => {

        if (this.scrollElement && this.scrollPosition != this.scrollElement.scrollLeft) {
            this.scrollPosition = this.scrollElement.scrollLeft
            // @ts-ignore
            let execute_scroll: (e: Element) => void
            const minscroll = 0
            const maxscroll = this.scrollElement.scrollWidth - this.scrollElement.clientWidth - 1;

            if (this.scrollElement.scrollLeft <= minscroll) {
                execute_scroll = this.scrollLeft
            } else if (this.scrollElement.scrollLeft >= maxscroll) {
                execute_scroll = this.scrollRight
            } else {
                return;
            }
            if (this.mouse_is_up) {
                execute_scroll(this.scrollElement)
            } else {
                this.mouseCallbackStore = () => {
                    execute_scroll(this.scrollElement!);
                }

                document.addEventListener("mouseup", this.mouseCallbackStore, {once: true})
            }
        }

    };

    componentDidMount() {
        document.addEventListener("mouseup", this.mouseUp_callback, true)
        document.addEventListener("mousedown", this.mouseDown_callback, true)
        this.scrollElement = document.getElementById(this.props.name)!.querySelector(".scheduler-view")!.lastElementChild;
        this.scrollElement?.addEventListener("scroll", this.onScroll_callback);

    }


    scrollLeft = (_scrollElement: Element) => {
        function wait(ms: number) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        if (this.scrollDebounce) {
            this.scrollDebounce = false;
            wait(250).then(() => {
                this.scrollDebounce = true;
            })
            this.schedulerData().prev();
            this.updateContextStartEnd(this.schedulerData());
            this.setState({viewChanged: this.state.viewChanged + 1}, () => {
                this.scroll(this._insertedRowStore?.firstElementChild?.getBoundingClientRect().width!);
            })
        }
    }

    scrollRight = (_scrollElement: Element) => {
        function wait(ms: number) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        if (this.scrollDebounce) {
            this.scrollDebounce = false;
            wait(250).then(() => {
                this.scrollDebounce = true;
            })
            this.schedulerData().next();
            this.updateContextStartEnd(this.schedulerData());
            this.setState({viewChanged: this.state.viewChanged + 1}, () => {
                this.scroll(_scrollElement.scrollWidth - this._insertedRowStore!.lastElementChild!.clientWidth - _scrollElement.clientWidth);
            })
        }
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

        return datejs
        // return null;

    }


    getLocalstore(): localStorageObject | undefined {
        let item = sessionStorage.getItem(this.props.guid);
        if (item) {
            return JSON.parse(item) as localStorageObject;
        }
    }

    syncLocalstore() {
        let elementAtScrollStart = this.getElementAtScrollStart();
        const store: localStorageObject = {
            scrollDate: elementAtScrollStart?.date,
        }
        sessionStorage.setItem(this.props.guid, JSON.stringify(store))
    }
}

interface localStorageObject {
    scrollDate?: string;
}

