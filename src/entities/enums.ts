export enum UserRole {
  STUDENT = 'student',
  TEACHER_APPLICANT = 'teacher_applicant',
  TEACHER_PENDING = 'teacher_pending',
  TEACHER = 'teacher',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  LOCKED = 'locked',
  DEACTIVATED = 'deactivated'
}

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RESUBMITTED = 'resubmitted'
}

export enum CourseStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved', 
  REJECTED = 'rejected',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum VideoType {
  STORAGE = 'storage',
  YOUTUBE = 'youtube'
}

export enum ReservationStatus {
  RESERVED = 'reserved',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PurchaseWay {
  LINE_PAY = 'line_pay',
  CREDIT_CARD = 'credit_card'
}

export enum EarningStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
  PAID = 'paid'
}

export enum SettlementStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  PAID = 'paid'
}

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin'
}

export enum CourseApplicationType {
  NEW_COURSE = 'new_course',
  RESUBMIT = 'resubmit'
}

export enum NotificationType {
  TEACHER_APPROVAL = 'teacher_approval',
  TEACHER_REJECTION = 'teacher_rejection',
  COURSE_APPROVAL = 'course_approval',
  COURSE_REJECTION = 'course_rejection',
  SYSTEM_NOTICE = 'system_notice'
}

export enum MessageType {
  GENERAL = 'general',
  ANNOUNCEMENT = 'announcement',
  SYSTEM = 'system'
}

export enum MessageTarget {
  SUBSCRIBERS = 'subscribers',
  PURCHASERS = 'purchasers',
  ALL = 'all'
}
