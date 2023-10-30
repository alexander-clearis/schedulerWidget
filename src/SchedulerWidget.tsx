import {Component, createElement, CSSProperties, ReactNode} from "react";
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'

import {SchedulerWidgetContainerProps} from "../typings/SchedulerWidgetProps";

import "./ui/SchedulerWidget.css";
import {
    DATE_FORMAT,
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
import dayjs from "dayjs";

export class SchedulerWidget extends Component<SchedulerWidgetContainerProps, { viewModel: SchedulerData }> {
    private config: SchedulerDataConfig = {
        ...defaultConfig,

        schedulerContentHeight: "calc(100%- 130px)",
        eventItemLineHeight: 50,
        eventItemHeight: 50,
        calendarPopoverEnabled: false,
        eventItemPopoverEnabled: false,
        endResizable: true,
        startResizable: true,
        dragAndDropEnabled: true,

        views: [
            {viewName: 'Month', viewType: ViewType.Month, showAgenda: false, isEventPerspective: false},
            {viewName: 'Quarter', viewType: ViewType.Quarter, showAgenda: false, isEventPerspective: false},
            {viewName: 'Year', viewType: ViewType.Year, showAgenda: false, isEventPerspective: false},
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

        let schedulerData = new SchedulerData(undefined, ViewType.Month, false, false, this.config, undefined);
        schedulerData.localeDayjs(dayjs())
        this.state = {viewModel: schedulerData}

    }

    componentDidMount() {
        console.error("componentDidUpdate!")

    }

    componentWillUnmount() {
        console.error("componentWillUnmount!")
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
                        resourceIsEditable: this.props.event_can_change_resource
                    }
                )
            )
        }
    }

    render(): ReactNode {

        return <div className={"flexFullWindow"} style={{flexGrow: 1, position: "relative"}}>
            <DndProvider backend={HTML5Backend}>
                <ClearisSchedulerWrapper {...this.getSchedulerProps()} />
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
            // eventItemClick: this.eventItemClick,
            nonAgendaCellHeaderTemplateResolver: this.nonAgendaCellHeaderTemplateResolver,
            updateEventStart: this.updateEventStart,
            updateEventEnd: this.updateEventEnd,
            moveEvent: this.moveEvent

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
        throw new Error("Function ( onSelectDate )not implemented.");
    }

    onViewChange = (schedulerData: SchedulerData, view: View): void => {
        schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
        // this.updateContextStartEnd(schedulerData)
        this.setState({viewModel: schedulerData});
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


        return <div key={event.id} className={classNames(mustAddCssClass, event.cssClass)} style={forcedStyle} onClick={() => {
            this.eventItemClick(_schedulerData, event)
        }
        }>
            <div className={"event-item__content"} style={{marginLeft: '4px', lineHeight: `${mustBeHeight}px`}}>
                <div className="event-item__images">

                </div>
                <div className={"event-item__wrapper"}>
                    <div className="event-item__title">{event.title}</div>
                    <div className="event-item__description">{event.description}</div>
                </div>
            </div>
        </div>;
    }

    private nonAgendaCellHeaderTemplateResolver = (schedulerData: SchedulerData, item: { time: string, nonWorkingTime: boolean }, formattedDateItems: string[], style: CSSProperties) => {
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

        return (
            <th key={item.time} className={`header3-text`} style={style}>
                {
                    formattedDateItems.map((formattedItem, index) => (
                        <div key={index}
                             dangerouslySetInnerHTML={{__html: formattedItem.replace(/[0-9]/g, '<b>$&</b>')}}/>
                    ))
                }
            </th>
        );
    }


    moveEvent = async (schedulerData: SchedulerData, event: ClearisEventType, slotId: string, slotName: string, _start: string, _end: string) => {
        let filter = ((schedulerData as any).events as Array<ClearisEventType>).filter(x => x.id === event.id)[0];
        schedulerData.moveEvent(filter, slotId, slotName, event.start, event.end);

        const mxobj = await this.resolve_mxObj(event);
        mxobj.set(this.props.eventresourceIDAttribute, slotId)
        mx.data.commit({
            mxobj: mxobj, callback: () => {
                this.setState({viewModel: schedulerData}, () => {

                });

            }
        })
    }

    updateEventStart = async (schedulerData: SchedulerData, event: ClearisEventType, start: string) => {

        let filter = ((schedulerData as any).events as Array<ClearisEventType>).filter(x => x.id === event.id)[0];

        schedulerData.updateEventStart(filter, start);

        const mxobj = await this.resolve_mxObj(event);

        mxobj.set(this.props.startAttribute, dayjs(start, DATE_FORMAT).startOf("day").unix() * 1000)

        mx.data.commit({
            mxobj: mxobj, callback: () => {
                this.setState({viewModel: schedulerData}, () => {

                });

            }
        })

    }
    updateEventEnd = async (schedulerData: SchedulerData, event: ClearisEventType, newEnd: string) => {

        let filter = ((schedulerData as any).events as Array<ClearisEventType>).filter(x => x.id === event.id);

        schedulerData.updateEventEnd(filter[0], newEnd);
        const mxobj = await this.resolve_mxObj(event);

        mxobj.set(this.props.endAttribute, dayjs(newEnd, DATE_FORMAT).endOf("day").unix() * 1000)
        mx.data.commit({
            mxobj: mxobj, callback: () => {
                this.setState({viewModel: schedulerData}, () => {

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
        console.log(event)
        this.props.event_onclick_action?.get(event.mxItem).execute();

    }
}
