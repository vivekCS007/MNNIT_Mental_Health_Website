// ---------------------------------------------------------------------------
// HOME PAGE DATA  (edit freely)
// ---------------------------------------------------------------------------
// This file holds the editable content for the home page sections:
//   NEWS_ITEMS    - the scrolling "TO NOTE" ticker
//   (more sections get added below as the home page grows)
// ---------------------------------------------------------------------------

// Each item: { tag, text }
//   tag  - small colored label (e.g. 'NEW', 'INFO')
//   text - the message shown in the ticker
export const NEWS_ITEMS = [
  {
    tag: 'NEW',
    text: 'In case of any emergency, please reach the Health Centre for assistance.'
  },
  {
    tag: 'INFO',
    text: 'Walk-in sessions are available at the MHWB Office during working hours.'
  },
  {
    tag: 'NEW',
    text: 'Online Single Session Therapy (SST) can be booked through the website.'
  }
]

// ---------------------------------------------------------------------------
// ANNOUNCEMENTS / NOTICE BOARD
// ---------------------------------------------------------------------------
// Each notice: { category, date, title, description, link }
//   category - small label shown at top of the card
//   date     - human-readable date string
//   title    - bold heading
//   description - body text
//   link     - { label, url } for the button (or null for no button)
export const ANNOUNCEMENTS = [
  // {
  //   category: 'SCHOLARSHIP',
  //   date: 'Mar 31, 2026',
  //   title: 'SBF List Released',
  //   description:
  //     'The list of selected students for the Student Benevolence Fund (SBF) scholarship has been released. Click below to view the complete list of selected candidates.',
  //   link: { label: 'View Details', url: '#' }
  // },
  {
    category: 'EVENT',
    date: 'Jun 22, 2026',
    title: 'RECCB 2026 Faculty Program',
    description:
      'A five-day online Faculty Upgradation Program on Research Excellence and Campus Culture Building is being conducted. Visit the Events page for full details.',
    link: { label: 'See Events', url : '/event/reccb' }
  },
  {
    category: 'NOTICE',
    date: 'Jun 20, 2026',
    title: 'International Day of Yoga',
    description:
      'The International Day of Yoga was celebrated under the flagship event "Yoga Sangam" with the theme "Yoga for Healthy Ageing" at the MP Hall.',
    link: { label: 'See Events', url : '/event/idy' }
  }
]

// ---------------------------------------------------------------------------
// RESOURCE CARDS  (the grid of service cards on the home page)
// ---------------------------------------------------------------------------
// Each card: { icon, meta, title, desc, cta, url }
//   icon  - name of a react-icons/fa icon (mapped in ResourceCards.jsx)
//   meta  - small label above the title
//   title - card heading
//   desc  - short description
//   cta   - button/link text
//   url   - where it links (internal '/...' or external/anchor)
export const RESOURCE_CARDS = [
  {
    icon: 'userMd',
    meta: 'CONFIDENTIAL',
    title: 'Individual Counselling',
    desc: 'One-on-one support for personal, academic, and emotional challenges.',
    cta: 'Book Now',
    url: '/book-appointment'
  },
  {
    icon: 'phone',
    meta: '24/7 SUPPORT',
    title: 'Emergency Support',
    desc: 'Immediate support during mental health emergencies.',
    cta: 'Get Help',
    url: '/emergency'
  },
  {
    icon: 'heart',
    meta: 'WELLBEING',
    title: 'Self-Help Tools',
    desc: 'Tools and guides designed to promote resilience and personal growth.',
    cta: 'Explore',
    url: '#'
  },
  {
    icon: 'users',
    meta: 'COMMUNITY',
    title: 'Peer Support',
    desc: 'Breaking the cycle of isolation through peer support groups.',
    cta: 'Join Us',
    url: '/team'
  },
  {
    icon: 'comments',
    meta: '24x7 COUNSELLING',
    title: 'External Counselling',
    desc: 'Access professional counselling support through Tele-MANAS.',
    cta: 'Book Now',
    url: '/tele_manas'
  },
  {
    icon: 'bookOpen',
    meta: 'RESOURCES',
    title: 'FAQs',
    desc: 'Find answers to common questions about counselling and services.',
    cta: 'Explore',
    url: '/faqs'
  }
]

// ---------------------------------------------------------------------------
// TESTIMONIALS  (student quotes carousel)
// ---------------------------------------------------------------------------
// Each item is a plain string (the quote). Add or remove freely.
export const TESTIMONIALS = [
  'I just wanted to express my gratitude for your support and understanding during stressful moments. Your advice has been a source of strength and clarity for me.',
  'I feel very good and happy, experiencing much less stress, and your strategy is working perfectly. Scheduling breaks at regular intervals has really helped.',
  'Now I am doing well, and the support I received helped me a lot to recover from this situation. I am truly grateful for the support.',
  'One of the biggest changes I have noticed is that I can now set healthy boundaries without feeling guilty. I speak up confidently now, and it has made a huge difference in how I feel and how others treat me.',
  'When I first came to counselling, I expected some magical solution. Instead, I got self-reflection tasks and reality checks, and those small pushes helped me understand myself better. I truly feel more in control now.',
  'You brought stability into one of the most chaotic phases of my life. You listened without judgment and guided me with clarity and patience. I will always be grateful for your support.'
]