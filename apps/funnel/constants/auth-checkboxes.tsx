import Link from "next/link";

export const CHECKBOXES = [
    {
        name: "isAdult",
        id: "confirm-age",
        label: <>I confirm that I am 18 years or older.</>,
    },
    {
        name: "acceptedTerms",
        id: "agree-terms",
        label: (
            <span>
                You agree to be bound by our&nbsp;
                <Link
                    href="https://valuable-wishbone-63d.notion.site/Terms-of-Service-2615e53c779980cb9a05ce9981c1f0fa"
                    target="_blank"
                    className="text-coral-red underline"
                >
                    Terms of Service&nbsp;
                </Link>
                and&nbsp;
                <Link
                    href="https://valuable-wishbone-63d.notion.site/Privacy-Policy-2615e53c77998053a001e1b1fb53e650"
                    target="_blank"
                    className="text-coral-red underline"
                >
                    Privacy Policy.
                </Link>
            </span>
        ),
    },
] as const;
