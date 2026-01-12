declare module "react-simple-maps" {
  import * as React from "react";

  export interface ComposableMapProps {
    projection?: string | Function;
    projectionConfig?: any;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;

  export interface GeographiesProps {
    geography?: string | object | string[];
    children?: (data: { geographies: any[] }) => React.ReactNode;
  }

  export const Geographies: React.FC<GeographiesProps>;

  export interface GeographyProps {
    geography?: any;
    onMouseEnter?: React.MouseEventHandler;
    onMouseLeave?: React.MouseEventHandler;
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    onClick?: React.MouseEventHandler;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    className?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  }

  export const Geography: React.FC<GeographyProps>;

  export interface MarkerProps {
    coordinates?: [number, number];
    children?: React.ReactNode;
    onMouseEnter?: React.MouseEventHandler;
    onMouseLeave?: React.MouseEventHandler;
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    onClick?: React.MouseEventHandler;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    className?: string;
  }

  export const Marker: React.FC<MarkerProps>;

  export interface ZoomableGroupProps {
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    center?: [number, number];
    onMoveStart?: Function;
    onMoveEnd?: Function;
    onMove?: Function;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
  }

  export const ZoomableGroup: React.FC<ZoomableGroupProps>;
}
