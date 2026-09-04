require('dotenv').config();

const DC_DOMAINS = {
  'zoho.com': {
    accounts: 'https://accounts.zoho.com',
    crm: 'https://www.zohoapis.com/crm/v2',
    people: 'https://people.zoho.com/people/api',
    desk: 'https://desk.zoho.com/api/v1',
    books: 'https://books.zoho.com/api/v3'
  },
  'zoho.in': {
    accounts: 'https://accounts.zoho.in',
    crm: 'https://www.zohoapis.in/crm/v2',
    people: 'https://people.zoho.in/people/api',
    desk: 'https://desk.zoho.in/api/v1',
    books: 'https://books.zoho.in/api/v3'
  },
  'zoho.eu': {
    accounts: 'https://accounts.zoho.eu',
    crm: 'https://www.zohoapis.eu/crm/v2',
    people: 'https://people.zoho.eu/people/api',
    desk: 'https://desk.zoho.eu/api/v1',
    books: 'https://books.zoho.eu/api/v3'
  },
  'zoho.com.au': {
    accounts: 'https://accounts.zoho.com.au',
    crm: 'https://www.zohoapis.com.au/crm/v2',
    people: 'https://people.zoho.com.au/people/api',
    desk: 'https://desk.zoho.com.au/api/v1',
    books: 'https://books.zoho.com.au/api/v3'
  }
};

const defaultDc = process.env.ZOHO_DC || 'zoho.com';
const endpoints = DC_DOMAINS[defaultDc] || DC_DOMAINS['zoho.com'];

module.exports = {
  clientId: process.env.ZOHO_CLIENT_ID || '',
  clientSecret: process.env.ZOHO_CLIENT_SECRET || '',
  refreshToken: process.env.ZOHO_REFRESH_TOKEN || '',
  dc: defaultDc,
  endpoints,
  isConfigured: Boolean(
    process.env.ZOHO_CLIENT_ID &&
    process.env.ZOHO_CLIENT_SECRET &&
    process.env.ZOHO_REFRESH_TOKEN &&
    !process.env.ZOHO_CLIENT_ID.includes('EXAMPLE')
  )
};
