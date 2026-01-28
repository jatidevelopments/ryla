/**
 * Waitlist API Route
 *
 * Handles waitlist form submissions and sends notifications to Slack
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface WaitlistRequest {
  email: string;
  referralSource:
    | 'tiktok'
    | 'reddit'
    | 'instagram'
    | 'google'
    | 'friend'
    | 'other';
  referralSourceOther?: string;
  aiInfluencerExperience: 'never' | 'few' | 'many';
  customMessage?: string;
}

export async function POST(request: Request) {
  try {
    const body: WaitlistRequest = await request.json();

    // Validate required fields
    if (!body.email || !body.referralSource || !body.aiInfluencerExperience) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Get Slack webhook URL from environment
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_WAITLIST;

    if (!slackWebhookUrl) {
      // Log error but don't fail the request - we still want to accept the submission
      console.error('SLACK_WEBHOOK_WAITLIST environment variable not set');
    } else {
      // Format referral source for display
      const referralSourceLabels: Record<string, string> = {
        tiktok: 'TikTok',
        reddit: 'Reddit',
        instagram: 'Instagram',
        google: 'Google',
        friend: 'Friend',
        other: 'Other',
      };

      const experienceLabels: Record<string, string> = {
        never: "I'm New Here",
        few: 'Some Experience',
        many: 'Very Experienced',
      };

      const referralDisplay =
        body.referralSource === 'other' && body.referralSourceOther
          ? `${referralSourceLabels[body.referralSource]} (${
              body.referralSourceOther
            })`
          : referralSourceLabels[body.referralSource];

      // Format Slack message
      const slackMessage = {
        text: '🎉 New Waitlist Signup',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🎉 New Waitlist Signup',
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Email:*\n${body.email}`,
              },
              {
                type: 'mrkdwn',
                text: `*Heard From:*\n${referralDisplay}`,
              },
              {
                type: 'mrkdwn',
                text: `*Experience:*\n${
                  experienceLabels[body.aiInfluencerExperience]
                }`,
              },
              {
                type: 'mrkdwn',
                text: `*Timestamp:*\n${new Date().toISOString()}`,
              },
            ],
          },
          ...(body.customMessage
            ? [
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `*Custom Message:*\n${body.customMessage}`,
                  },
                },
              ]
            : []),
        ],
      };

      // Send to Slack
      try {
        const slackResponse = await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(slackMessage),
        });

        if (!slackResponse.ok) {
          console.error(
            'Failed to send Slack notification:',
            await slackResponse.text()
          );
        }
      } catch (slackError) {
        console.error('Error sending Slack notification:', slackError);
        // Don't fail the request if Slack fails
      }
    }

    // Return success response
    return Response.json(
      { success: true, message: 'Successfully joined waitlist' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Waitlist submission error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
