// @ts-ignore
import { Component, ReactNode, createElement } from "react";
import { SchedulerWidgetPreviewProps } from "../typings/SchedulerWidgetProps";

export class preview extends Component<SchedulerWidgetPreviewProps> {
    render(): ReactNode {
        return [];
    }
}

export function getPreviewCss(): string {
    return require("./ui/SchedulerWidget.css");
}
