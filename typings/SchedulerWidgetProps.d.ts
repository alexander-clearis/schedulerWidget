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
    SuggestedViewDate: EditableValue<Date>;
    guid: string;
    on_context_change?: ActionValue;
    onChangeValidation: string;
    resource_datasource: ListValue;
    resource_id_attribute?: ListAttributeValue<string | Big>;
    resource_title_attribute: ListAttributeValue<string>;
    event_datasource: ListValue;
    event_resource_id_attribute?: ListAttributeValue<string | Big>;
    event_resource_id_association?: ListReferenceValue;
    event_id_attribute?: ListAttributeValue<string | Big>;
    event_start_attribute: ListAttributeValue<Date>;
    event_end_attribute: ListAttributeValue<Date>;
    event_name_attribute: ListAttributeValue<string>;
    event_description_attribute?: ListExpressionValue<string>;
    event_class_attribute?: ListExpressionValue<string>;
    event_image?: ListAttributeValue<string>;
    event_can_change_time?: ListAttributeValue<boolean>;
    event_can_change_resource?: ListAttributeValue<boolean>;
    startAttribute: string;
    endAttribute: string;
    eventresourceIDAttribute: string;
    eventresourceAssociation: string;
    event_onclick_action?: ListActionValue;
    resource_onclick_action?: ListActionValue;
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
    SuggestedViewDate: string;
    guid: string;
    on_context_change: {} | null;
    onChangeValidation: string;
    resource_datasource: {} | { caption: string } | { type: string } | null;
    resource_id_attribute: string;
    resource_title_attribute: string;
    event_datasource: {} | { caption: string } | { type: string } | null;
    event_resource_id_attribute: string;
    event_resource_id_association: string;
    event_id_attribute: string;
    event_start_attribute: string;
    event_end_attribute: string;
    event_name_attribute: string;
    event_description_attribute: string;
    event_class_attribute: string;
    event_image: string;
    event_can_change_time: string;
    event_can_change_resource: string;
    startAttribute: string;
    endAttribute: string;
    eventresourceIDAttribute: string;
    eventresourceAssociation: string;
    event_onclick_action: {} | null;
    resource_onclick_action: {} | null;
}
