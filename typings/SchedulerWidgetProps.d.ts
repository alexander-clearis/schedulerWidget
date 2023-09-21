/**
 * This file was generated from SchedulerWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, ListActionValue, ListAttributeValue, ListExpressionValue, ListReferenceValue } from "mendix";
import { Big } from "big.js";

export interface SchedulerWidgetContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    VisibleDateStartDate: EditableValue<Date>;
    VisibleDateEndDate: EditableValue<Date>;
    on_context_change?: ActionValue;
    resource_datasource: ListValue;
    resource_id_attribute?: ListAttributeValue<string | Big>;
    resource_title_attribute: ListAttributeValue<string>;
    resource_description_attribute: ListAttributeValue<string>;
    event_datasource: ListValue;
    event_resource_id_attribute?: ListAttributeValue<string | Big>;
    event_resource_id_association?: ListReferenceValue;
    event_id_attribute?: ListAttributeValue<string | Big>;
    event_start_attribute: ListAttributeValue<Date>;
    event_end_attribute: ListAttributeValue<Date>;
    event_name_attribute: ListAttributeValue<string>;
    event_description_attribute?: ListExpressionValue<string>;
    event_class_attribute?: ListExpressionValue<string>;
    event_resizable_attribute?: ListAttributeValue<boolean>;
    event_movable_attribute?: ListAttributeValue<boolean>;
    event_onclick_action?: ListActionValue;
}

export interface SchedulerWidgetPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    VisibleDateStartDate: string;
    VisibleDateEndDate: string;
    on_context_change: {} | null;
    resource_datasource: {} | { caption: string } | { type: string } | null;
    resource_id_attribute: string;
    resource_title_attribute: string;
    resource_description_attribute: string;
    event_datasource: {} | { caption: string } | { type: string } | null;
    event_resource_id_attribute: string;
    event_resource_id_association: string;
    event_id_attribute: string;
    event_start_attribute: string;
    event_end_attribute: string;
    event_name_attribute: string;
    event_description_attribute: string;
    event_class_attribute: string;
    event_resizable_attribute: string;
    event_movable_attribute: string;
    event_onclick_action: {} | null;
}
