export interface SignUpEventProps {
    distinct_id: number | string;
    tid?: string;
    utmOnRegistration?: Record<string, any>;
}

export interface PaymentEventProps {
    distinct_id: number | string;
    product_name: string;
    value: number;
    currency: string;
    tid?: string;
    product_id: number | string;
}

export interface UTMProps {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    deal?: string;
    [key: string]: any;
}
