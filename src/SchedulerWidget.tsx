import {Component, createElement, CSSProperties, ReactNode} from "react";
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'

import {SchedulerWidgetContainerProps} from "../typings/SchedulerWidgetProps";

import "./ui/SchedulerWidget.css";
import {
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

export class SchedulerWidget extends Component<SchedulerWidgetContainerProps, { viewModel: SchedulerData }> {
    private config: SchedulerDataConfig = {
        ...defaultConfig,

        schedulerContentHeight: "calc(100%- 130px)",
        eventItemLineHeight: 50,
        eventItemHeight: 50

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


        let schedulerData = new SchedulerData(undefined, ViewType.Month, false, false, this.config, undefined);

        this.state = {viewModel: schedulerData}
        // this.schedulerData().setDate(dayjs().format(DATETIME_FORMAT))


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
            this.schedulerData().setResources(Util.createSchedulerResources(this.props.resource_datasource.items, this.props.resource_id_attribute, this.props.resource_title_attribute, this.props.resource_description_attribute))
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
                        resizableAttribute: this.props.event_resizable_attribute
                    }
                )
            )
        }
    }

    render(): ReactNode {
        console.error("RELOAD!")
        return <div className={"flexFullWindow"} style={{flexGrow: 1, position: "relative"}}>
            <div>
                <button onClick={_event => {
                    console.log(this)
                    console.log(this.state.viewModel)
                }

                }>


                </button>
            </div>
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
            nonAgendaCellHeaderTemplateResolver: this.nonAgendaCellHeaderTemplateResolver,
            eventItemClick: this.eventItemClick
        }
    }

    private updateContextStartEnd(_schedulerData: SchedulerData) {

        this.props.VisibleDateStartDate.setValue(_schedulerData.getViewStartDate().toDate());
        this.props.VisibleDateEndDate.setValue(_schedulerData.getViewEndDate().toDate());

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
        this.updateContextStartEnd(schedulerData)
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


        return <div key={event.id} className={classNames(mustAddCssClass, event.cssClass)} style={forcedStyle}>
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
        }
        else {
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

    eventItemClick =  (_schedulerData: SchedulerData, event: ClearisEventType) =>  {
        console.log(event)
    };

}
