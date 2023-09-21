import {ListAttributeValue, ListExpressionValue, ListReferenceValue, ObjectItem} from "mendix";
import {EventItem, Resource} from "react-big-scheduler-stch";
import {Big} from "big.js";


export namespace Util {
    export type ID_Attribute_Type = ListAttributeValue<string | Big>;

    export interface ClearisEventType extends EventItem {
        description?: string;
        cssClass?: string
    }

    export function createSchedulerResources(items: ObjectItem[], idAttribute: ID_Attribute_Type | undefined, titleAttribute: ListAttributeValue<string>, _discriptionAttribute: ListAttributeValue<string>): Resource[] {
        return items.map(objectItem => {
            return {
                id: (idAttribute) ? idAttribute.get(objectItem).displayValue : objectItem.id,
                name: titleAttribute.get(objectItem).displayValue,
                groupOnly: undefined,
                parentId: undefined

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
        resizableAttribute?: ListAttributeValue<boolean>
        movableAttribute?: ListAttributeValue<boolean>
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
                resourceId: getResourceId(objectItem),
                start: attributes.startAttribute.get(objectItem).displayValue,
                end: attributes.endAttribute.get(objectItem).displayValue,
                title: attributes.titleAttribute.get(objectItem).displayValue,
                description: attributes.descriptionAttribute?.get(objectItem).value ?? undefined,
                cssClass: attributes.classAttribute?.get(objectItem).value ?? undefined,
                resizable: attributes.resizableAttribute?.get(objectItem).value ?? true,
                movable: attributes.movableAttribute?.get(objectItem).value ?? false
            } as ClearisEventType
        })
    }
}