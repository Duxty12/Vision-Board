import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  name?: string;
  dashboardUrl?: string;
}

export const WelcomeEmail = ({
  name = 'Dreamer',
  dashboardUrl = 'http://localhost:3000/dashboard',
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to StillBoard — Create your first vision board!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={logo}>StillBoard</Heading>
        <Text style={paragraph}>Hi {name},</Text>
        <Text style={paragraph}>
          Welcome to StillBoard, your personal space for goals, tasks, quotes, and visual inspiration. No algorithms, no social noise — just your personal cork board to help you focus and execute.
        </Text>
        
        <Heading as="h2" style={subtitle}>3 Quick Tips to Get Started:</Heading>
        <Section style={tipsSection}>
          <Text style={tipItem}>
            <strong>1. Choose a Theme:</strong> Switch between Cork, Linen, soft Gradients, or Dark Mode to suit your aesthetic.
          </Text>
          <Text style={tipItem}>
            <strong>2. Add Goals & Tasks:</strong> Create visual sticky notes with targets, deadlines, and checklists.
          </Text>
          <Text style={tipItem}>
            <strong>3. Star for the Dashboard:</strong> Star your most important boards and cards to pin them directly to your main dashboard view.
          </Text>
        </Section>

        <Section style={btnContainer}>
          <Button style={button} href={dashboardUrl}>
            Go to your Dashboard
          </Button>
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

const subtitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#292524',
  marginTop: '24px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#44403c',
};

const tipsSection = {
  padding: '12px 20px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  border: '1px solid #e7e5e4',
  margin: '16px 0',
};

const tipItem = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#44403c',
  margin: '8px 0',
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
  display: 'block',
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
