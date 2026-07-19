import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface CardItem {
  id: string;
  type: 'goal' | 'task' | 'image' | 'quote' | 'video';
  title?: string | null;
  description?: string | null;
  content?: string | null;
  attribution?: string | null;
  color?: string | null;
  category?: string | null;
  is_starred?: boolean | null;
  media?: {
    storage_path?: string | null;
    youtube_url?: string | null;
    youtube_video_id?: string | null;
    thumbnail_url?: string | null;
    public_url?: string | null;
  }[];
}

interface BoardShareEmailProps {
  name?: string;
  boardTitle?: string;
  cards?: CardItem[];
  screenshotUrl?: string;
  dashboardUrl?: string;
}

export const BoardShareEmail = ({
  name = 'Dreamer',
  boardTitle = 'My Vision Board',
  cards = [],
  screenshotUrl,
  dashboardUrl = 'http://localhost:3000/dashboard',
}: BoardShareEmailProps) => (
  <Html>
    <Head />
    <Preview>Your Vision Board: {boardTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={logo}>StillBoard</Heading>
        <Text style={paragraph}>Hi {name},</Text>
        <Text style={paragraph}>
          Here is a snapshot of your vision board <strong>{boardTitle}</strong>. Keep dreaming and doing!
        </Text>

        {/* Board Header Banner */}
        <Section style={boardBanner}>
          <Text style={boardBannerTitle}>{boardTitle}</Text>
          <Text style={boardBannerMeta}>{cards.length} card{cards.length !== 1 ? 's' : ''} on this board</Text>
        </Section>

        {/* Board Screenshot — full-width image if captured */}
        {screenshotUrl && (
          <Section style={screenshotSection}>
            <Img
              src={screenshotUrl}
              alt={`Vision Board: ${boardTitle}`}
              style={screenshotImg}
              width="540"
            />
          </Section>
        )}

        {/* Divider label before card list */}
        {screenshotUrl && cards.length > 0 && (
          <Text style={cardListLabel}>Card breakdown:</Text>
        )}

        {cards.length === 0 ? (
          <Section style={emptyState}>
            <Text style={emptyText}>
              This board has no cards yet. Head to your canvas and start adding goals, tasks, quotes, and more!
            </Text>
          </Section>
        ) : (
          cards.map((card) => {
            const cardBg = (card.type === 'image' || card.type === 'video') ? '#ffffff' : (card.color || '#FFF3B0');
            return (
              <Section key={card.id} style={{ ...cardContainer, backgroundColor: cardBg }}>
                <span style={categoryBadge}>{card.category || card.type.toUpperCase()}</span>
                {card.is_starred && <span style={starBadge}>★ Starred</span>}

                {card.title && <Heading as="h3" style={cardTitle}>{card.title}</Heading>}

                {card.type === 'quote' && card.content && (
                  <Text style={quoteText}>
                    "{card.content}"
                    {card.attribution && <span style={quoteAttribution}> — {card.attribution}</span>}
                  </Text>
                )}

                {card.type !== 'quote' && card.content && (
                  <Text style={cardDescription}>{card.content}</Text>
                )}

                {card.description && <Text style={cardDescription}>{card.description}</Text>}

                {/* Media thumbnails */}
                {card.media && card.media.length > 0 && (
                  <Section style={mediaSection}>
                    {card.media.map((med, index) => {
                      const imgUrl = med.public_url || med.thumbnail_url;
                      if (!imgUrl) return null;
                      return (
                        <Img
                          key={index}
                          src={imgUrl}
                          alt="Card Media"
                          style={mediaImg}
                        />
                      );
                    })}
                  </Section>
                )}
              </Section>
            );
          })
        )}

        <Section style={btnContainer}>
          <Link style={button} href={dashboardUrl}>
            Open My Canvas
          </Link>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          StillBoard — built for dreamers who do.
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f5f3',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const logo = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#c07423',
  textAlign: 'center' as const,
  margin: '30px 0',
  fontFamily: 'Georgia, serif',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#44403c',
};

const cardContainer = {
  padding: '20px',
  borderRadius: '12px',
  margin: '20px 0',
  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  border: '1px solid rgba(0,0,0,0.06)',
};

const screenshotSection = {
  margin: '0 0 28px',
};

const screenshotImg = {
  width: '100%',
  borderRadius: '14px',
  border: '3px solid #c07423',
  display: 'block',
};

const cardListLabel = {
  fontSize: '13px',
  fontWeight: 'bold',
  color: '#78716c',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.8px',
  margin: '4px 0 10px',
};

const boardBanner = {
  backgroundColor: '#c07423',
  borderRadius: '12px',
  padding: '20px 24px',
  margin: '16px 0 20px',
};

const boardBannerTitle = {
  fontSize: '22px',
  fontWeight: 'bold',
  color: '#ffffff',
  fontFamily: 'Georgia, serif',
  margin: '0 0 4px 0',
};

const boardBannerMeta = {
  fontSize: '12px',
  color: 'rgba(255,255,255,0.8)',
  margin: '0',
};

const starBadge = {
  display: 'inline-block',
  fontSize: '10px',
  fontWeight: 'bold',
  backgroundColor: 'rgba(251,191,36,0.25)',
  color: '#92400e',
  padding: '2px 7px',
  borderRadius: '4px',
  marginLeft: '6px',
  letterSpacing: '0.3px',
};

const categoryBadge = {
  display: 'inline-block',
  fontSize: '11px',
  fontWeight: 'bold',
  backgroundColor: 'rgba(0,0,0,0.08)',
  color: '#292524',
  padding: '2px 8px',
  borderRadius: '4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginBottom: '10px',
};

const cardTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1c1917',
  margin: '0 0 8px 0',
};

const cardDescription = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#44403c',
  margin: '4px 0',
};

const quoteText = {
  fontSize: '16px',
  fontStyle: 'italic',
  color: '#292524',
  lineHeight: '24px',
  fontFamily: 'Georgia, serif',
  margin: '10px 0',
};

const quoteAttribution = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 'bold',
  fontStyle: 'normal',
  color: '#57534e',
  marginTop: '4px',
};

const mediaSection = {
  marginTop: '12px',
};

const mediaImg = {
  width: '100%',
  maxHeight: '240px',
  objectFit: 'cover' as const,
  borderRadius: '8px',
};

const emptyState = {
  padding: '30px 20px',
  backgroundColor: '#fff',
  borderRadius: '12px',
  border: '1px solid #e7e5e4',
  textAlign: 'center' as const,
  margin: '20px 0',
};

const emptyText = {
  fontSize: '14px',
  color: '#78716c',
};

const btnContainer = {
  textAlign: 'center' as const,
  margin: '32px 0 16px',
};

const button = {
  backgroundColor: '#c07423',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#e7e5e4',
  margin: '20px 0',
};

const footer = {
  color: '#a8a29e',
  fontSize: '12px',
  textAlign: 'center' as const,
};
