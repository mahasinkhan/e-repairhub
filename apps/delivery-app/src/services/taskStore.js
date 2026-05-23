/** Shared task state — syncs Tasks, TaskDetail, Dashboard, Delivery/Pickup lists */

const STORAGE_KEY = 'delivery_tasks_v1'
const EVENT = 'delivery-tasks-updated'

const SEED_TASKS = [
  { id: '#ERH256', customer: 'Rohit Sharma', phone: '9878563210', address: '24, MG Road, Indore', deliveryAddress: 'Tech Hub, Sector 12, Gandhinagar, Gujarat', device: 'Screen Replacement', type: 'Pickup', status: 'Pending', time: '9:30 AM', instructions: 'Customer is aware about the delivery.' },
  { id: '#ERH257', customer: 'Neha Verma', phone: '9654321098', address: '50, Vijay Nagar, Indore', deliveryAddress: '22, Civil Lines, Jaipur, Rajasthan', device: 'Battery Replacement', type: 'Delivery', status: 'In Progress', time: '10:00 AM', instructions: 'Handle with care. Fragile device.' },
  { id: '#ERH258', customer: 'Amit Patel', phone: '7654321098', address: '78, Palasia, Indore', deliveryAddress: '5, Navrangpura, Ahmedabad, Gujarat', device: 'iPhone 13 Repair', type: 'Pickup', status: 'Pending', time: '1:30 PM', instructions: '' },
  { id: '#ERH259', customer: 'Pooja Singh', phone: '8543210987', address: '12, Rajwada, Indore', deliveryAddress: '9, MG Road, Pune, Maharashtra', device: 'Laptop Screen', type: 'Delivery', status: 'Pending', time: '3:00 PM', instructions: 'Please call before delivery.' },
  { id: '#ERH260', customer: 'Vikas Mehta', phone: '5432109876', address: '33, Bhawarkuan, Indore', deliveryAddress: '18, Sector 5, Noida, UP', device: 'Samsung S22 Repair', type: 'Delivery', status: 'Completed', time: '5:15 PM', instructions: '' },
  { id: '#ERH261', customer: 'Sunil Yadav', phone: '4321098765', address: '9, Sudama Nagar, Indore', deliveryAddress: '45, Anna Salai, Chennai, TN', device: 'iPad Screen', type: 'Pickup', status: 'Completed', time: '6:00 PM', instructions: 'Leave with security guard if not available.' },
  { id: '#ERH262', customer: 'Kavya Reddy', phone: '9123456780', address: '45, AB Road, Indore', deliveryAddress: '7, Jubilee Hills, Hyderabad, TS', device: 'OnePlus Repair', type: 'Pickup', status: 'In Progress', time: '10:30 AM', instructions: '' },
  { id: '#ERH263', customer: 'Arjun Tiwari', phone: '8012345678', address: '7, Race Course, Indore', deliveryAddress: '3, Connaught Place, New Delhi', device: 'MacBook Keyboard', type: 'Delivery', status: 'Completed', time: '11:45 AM', instructions: 'Customer is at office during delivery.' },
  { id: '#ERH264', customer: 'Sneha Kapoor', phone: '7890123456', address: '22, Scheme 54, Indore', deliveryAddress: '12, Park Street, Kolkata, WB', device: 'Realme Charging', type: 'Delivery', status: 'Pending', time: '2:00 PM', instructions: '' },
  { id: '#ERH265', customer: 'Deepak Joshi', phone: '6789012345', address: '18, Bhanwarkuan, Indore', deliveryAddress: '30, FC Road, Pune, Maharashtra', device: 'Pixel 6 Screen', type: 'Pickup', status: 'Completed', time: '4:30 PM', instructions: '' },
  { id: '#ERH266', customer: 'Priya Malhotra', phone: '5678901234', address: '66, Geeta Bhawan, Indore', deliveryAddress: '88, DLF Phase 3, Gurgaon, HR', device: 'Vivo Battery', type: 'Delivery', status: 'In Progress', time: '9:00 AM', instructions: 'Call before reaching.' },
  { id: '#ERH267', customer: 'Raj Kumar', phone: '4567890123', address: '3, Manik Bagh, Indore', deliveryAddress: '10, Indiranagar, Bengaluru, KA', device: 'Redmi 11 Glass', type: 'Pickup', status: 'Pending', time: '12:00 PM', instructions: '' },
  { id: '#ERH268', customer: 'Anjali Singh', phone: '3456789012', address: '88, Navlakha, Indore', deliveryAddress: '6, Salt Lake, Kolkata, WB', device: 'HP Laptop Repair', type: 'Delivery', status: 'Completed', time: '1:00 PM', instructions: '' },
  { id: '#ERH269', customer: 'Rahul Gupta', phone: '2345678901', address: '55, LIG Colony, Indore', deliveryAddress: '77, Vasant Kunj, New Delhi', device: 'iPhone 12 Camera', type: 'Pickup', status: 'Pending', time: '3:30 PM', instructions: 'Urgent repair needed.' },
  { id: '#ERH270', customer: 'Meena Sharma', phone: '1234567890', address: '11, Sanyogitaganj, Indore', deliveryAddress: '25, Koregaon Park, Pune, MH', device: 'Mi TV Repair', type: 'Delivery', status: 'In Progress', time: '5:00 PM', instructions: '' },
  { id: '#ERH271', customer: 'Saurabh Dixit', phone: '9988776655', address: '30, Khajrana, Indore', deliveryAddress: '14, Bandra West, Mumbai, MH', device: 'Oppo Screen', type: 'Pickup', status: 'Completed', time: '6:30 PM', instructions: '' },
  { id: '#ERH272', customer: 'Tanvi Jain', phone: '8877665544', address: '16, Annapurna, Indore', deliveryAddress: '2, Ashok Nagar, Bhopal, MP', device: 'Poco Charging Port', type: 'Delivery', status: 'Pending', time: '8:30 AM', instructions: 'Preferred slot: morning.' },
  { id: '#ERH273', customer: 'Lokesh Verma', phone: '7766554433', address: '42, South Tukoganj, Indore', deliveryAddress: '50, Green Park, New Delhi', device: 'Nokia Screen', type: 'Pickup', status: 'In Progress', time: '11:00 AM', instructions: '' },
  { id: '#ERH274', customer: 'Nisha Patel', phone: '6655443322', address: '5, Rau, Indore', deliveryAddress: '21, Vastrapur, Ahmedabad, GJ', device: 'Tablet Battery', type: 'Delivery', status: 'Completed', time: '2:45 PM', instructions: '' },
]

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return SEED_TASKS.map((t) => ({ ...t }))
}

let tasks = load()

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { tasks } }))
}

export function getTasks() {
  return tasks.map((t) => ({ ...t }))
}

export function getTaskById(id) {
  return tasks.find((t) => t.id === id) ? { ...tasks.find((t) => t.id === id) } : null
}

export function subscribeTasks(handler) {
  const fn = (e) => handler(e.detail?.tasks ?? getTasks())
  window.addEventListener(EVENT, fn)
  return () => window.removeEventListener(EVENT, fn)
}

export function updateTask(id, patch) {
  const i = tasks.findIndex((t) => t.id === id)
  if (i === -1) return null
  tasks[i] = { ...tasks[i], ...patch, updatedAt: new Date().toISOString() }
  persist()
  return { ...tasks[i] }
}

export function rescheduleTask(id, { date, time, reason }) {
  return updateTask(id, {
    status: 'Rescheduled',
    rescheduleDate: date,
    rescheduleTime: time,
    rescheduleReason: reason || 'Customer not answering phone',
    customerNotReachable: true,
  })
}

export function completeDelivery(id, { paymentMethod }) {
  return updateTask(id, {
    status: 'Completed',
    paymentMethod: paymentMethod || 'scan',
    deliveredAt: new Date().toISOString(),
    otpVerified: true,
  })
}

export function completePickup(id, { imageDataUrl, imageName }) {
  return updateTask(id, {
    status: 'Completed',
    pickupImage: imageDataUrl,
    pickupImageName: imageName,
    pickedAt: new Date().toISOString(),
    otpVerified: true,
  })
}

export function mapToDeliveryStatus(status) {
  if (status === 'Completed') return 'Delivered'
  if (status === 'Rescheduled') return 'Rescheduled'
  if (status === 'In Progress') return 'Out for Delivery'
  if (status === 'Pending') return 'Out for Delivery'
  return status
}

export function mapToPickupStatus(status) {
  if (status === 'Completed') return 'Picked Up'
  if (status === 'Rescheduled') return 'Rescheduled'
  if (status === 'In Progress') return 'In Progress'
  return status
}

export { SEED_TASKS as ALL_TASKS_SEED }
