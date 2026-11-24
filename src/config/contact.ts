import { getRootDomain } from './domain';

const founderMailbox = 'ramansarsa';
const founderMailHost = ['zohomail', 'in'].join('.');
const supportMailbox = 'help';

export const founderEmail = `${founderMailbox}@${founderMailHost}`;
export const getSupportEmail = (): string => `${supportMailbox}@${getRootDomain()}`;

export const founder = {
  name: 'Raman Sharma',
  role: 'Founder & Lead Architect',
  location: 'Village Sarsa, Pehowa, Kurukshetra, Haryana, India',
};
