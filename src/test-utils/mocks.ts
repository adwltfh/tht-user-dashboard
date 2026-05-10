import { User } from '@/lib/types'

export const mockUsers: User[] = [
  {
    id: 1,
    name: 'Leanne Graham',
    username: 'Bret',
    email: 'Sincere@april.biz',
    phone: '1-770-736-8031',
    website: 'hildegard.org',
    address: {
      street: 'Kulas Light',
      suite: 'Apt. 556',
      city: 'Gwenborough',
      zipcode: '92998-3874',
      geo: { lat: '-37.3159', lng: '81.1496' },
    },
    company: {
      name: 'Romaguera-Crona',
      catchPhrase: 'Multi-layered client-server neural-net',
      bs: 'harness real-time e-markets',
    },
  },
  {
    id: 2,
    name: 'Ervin Howell',
    username: 'Antonette',
    email: 'Shanna@melissa.tv',
    phone: '010-692-6593',
    website: 'anastasia.net',
    address: {
      street: 'Victor Plains',
      suite: 'Suite 879',
      city: 'Wisokyburgh',
      zipcode: '90566-7771',
      geo: { lat: '-43.9509', lng: '-34.4618' },
    },
    company: {
      name: 'Deckow-Crist',
      catchPhrase: 'Proactive didactic contingency',
      bs: 'synergize scalable supply-chains',
    },
  },
]

export const mockPosts = [
  { id: 1, userId: 1, title: 'Post one', body: 'Body one' },
  { id: 2, userId: 1, title: 'Post two', body: 'Body two' },
  { id: 3, userId: 2, title: 'Post three', body: 'Body three' },
]

export const mockTodos = [
  { id: 1, userId: 1, title: 'Todo one', completed: true },
  { id: 2, userId: 1, title: 'Todo two', completed: false },
  { id: 3, userId: 2, title: 'Todo three', completed: false },
  { id: 4, userId: 2, title: 'Todo four', completed: false },
]