import { ListAttributeValue, ListExpressionValue, ListReferenceValue, ObjectItem} from "mendix";

import {DATE_FORMAT, EventItem, Resource} from "react-big-scheduler-stch";
import {Big} from "big.js";
import dayjs from "dayjs";


export namespace Util {
    export type ID_Attribute_Type = ListAttributeValue<string | Big>;

    export interface ClearisEventType extends EventItem {
        id: string
        mxGuid: string
        description?: string;
        cssClass?: string
        mxObj?: mendix.lib.MxObject
        mxItem: ObjectItem
        imageBase64?: string
    }

    export function createSchedulerResources(items: ObjectItem[], idAttribute: ID_Attribute_Type | undefined, titleAttribute: ListAttributeValue<string>): Resource[] {
        return items.map(objectItem => {
            return {
                id: (idAttribute) ? idAttribute.get(objectItem).displayValue : objectItem.id,
                name: titleAttribute.get(objectItem).displayValue,
                groupOnly: undefined,
                parentId: undefined,
                mxItem: objectItem
            }
        })
    }

    export interface eventAttributes {
        idAttribute: Util.ID_Attribute_Type | undefined,
        resource_id_property: Util.ID_Attribute_Type | ListReferenceValue,
        startAttribute: ListAttributeValue<Date>,
        endAttribute: ListAttributeValue<Date>,
        titleAttribute: ListAttributeValue<string>,
        descriptionAttribute?: ListExpressionValue<string>,
        typeAttribute?: ListAttributeValue<string>,
        classAttribute?: ListExpressionValue<string>
        timeIsEditable?: ListAttributeValue<boolean>
        resourceIsEditable?: ListAttributeValue<boolean>
        imageAttribute?: ListAttributeValue<string>
    }

    export function createSchedulerEvents(items: ObjectItem[], attributes: eventAttributes): ClearisEventType[] {

        function is_id_from_refrence(id_property: Util.ID_Attribute_Type | ListReferenceValue): id_property is ListReferenceValue {
            return id_property.type == "Reference"
        }

        function getResourceId(objectItem: ObjectItem): string | undefined {
            if (is_id_from_refrence(attributes.resource_id_property)) {
                return attributes.resource_id_property.get(objectItem).value?.id
            } else {
                return attributes.resource_id_property.get(objectItem).displayValue
            }

        }

        return items.map(objectItem => {

            return {
                id: (attributes.idAttribute) ? attributes.idAttribute.get(objectItem).displayValue : objectItem.id,
                mxGuid: objectItem.id as string,
                resourceId: getResourceId(objectItem),
                start: dayjs(attributes.startAttribute.get(objectItem).value).format(DATE_FORMAT),
                end: dayjs(attributes.endAttribute.get(objectItem).value).format(DATE_FORMAT),
                title: attributes.titleAttribute.get(objectItem).displayValue,
                description: attributes.descriptionAttribute?.get(objectItem).value ?? undefined,
                cssClass: attributes.classAttribute?.get(objectItem).value ?? undefined,
                resizable: attributes.timeIsEditable?.get(objectItem).value ?? false,
                movable: attributes.resourceIsEditable?.get(objectItem).value ?? false,
                mxItem: objectItem,
                imageBase64: attributes.imageAttribute?.get(objectItem).value ?? undefined
            } as ClearisEventType
        })
    }
}