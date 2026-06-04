const STORAGE_KEY = 'delivery_notifications_v1'
const EVENT = 'delivery-notifications-updated'

const SEED = [
  {
    id: 1,
    type: 'task',
    title: 'New task assigned',
    description: 'Order #ERH257 has been assigned to you.',
    time: '2 mins ago',
    isRead: false,
    category: 'updates',
    createdAt: Date.now() - 120000,
  },
  {
    id: 2,
    type: 'pickup',
    title: 'Pickup completed',
    description: 'You have successfully picked up order #ERH261.',
    time: '15 mins ago',
    isRead: false,
    category: 'updates',
    createdAt: Date.now() - 900000,
  },
  {
    id: 3,
    type: 'delivery',
    title: 'Delivery assigned',
    description: 'New delivery task #ERH264 assigned.',
    time: '45 mins ago',
    isRead: true,
    category: 'updates',
    createdAt: Date.now() - 2700000,
  },
]

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return [...SEED]
}

let list = load()
let nextId = Math.max(0, ...list.map((n) => n.id)) + 1

function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m} mins ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`
  return `${Math.floor(h / 24)} days ago`
}

function persist() {
  list = list.map((n) => ({ ...n, time: timeAgo(n.createdAt || Date.now()) }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { notifications: list } }))
}

export function getNotifications() {
  return list.map((n) => ({ ...n, time: timeAgo(n.createdAt || Date.now()) }))
}

export function subscribeNotifications(handler) {
  const fn = () => handler(getNotifications())
  window.addEventListener(EVENT, fn)
  return () => window.removeEventListener(EVENT, fn)
}

export function addNotification({ type, title, description, category = 'updates' }) {
  const item = {
    id: nextId++,
    type,
    title,
    description,
    time: 'Just now',
    isRead: false,
    category,
    createdAt: Date.now(),
  }
  list = [item, ...list]
  persist()
  return item
}

export function markAsRead(id) {
  list = list.map((n) => (n.id === id ? { ...n, isRead: true } : n))
  persist()
}

export function markAllAsRead() {
  list = list.map((n) => ({ ...n, isRead: true }))
  persist()
}

export function getUnreadCount() {
  return list.filter((n) => !n.isRead).length
}