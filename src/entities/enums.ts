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
  PENDING = 'pending',      // 等待教師確認
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
  PENDING = 'pending',        // 待付款 (對應原 OrderStatus.PENDING)
  PROCESSING = 'processing',  // 付款處理中
  COMPLETED = 'completed',    // 付款完成 (對應原 OrderStatus.PAID)  
  FAILED = 'failed',          // 付款失敗
  CANCELLED = 'cancelled',    // 訂單取消 (對應原 OrderStatus.CANCELLED)
  EXPIRED = 'expired',        // 付款過期
  REFUNDED = 'refunded'       // 已退款
}

export enum PurchaseWay {
  ALL = 'all',
  LINE_PAY = 'line_pay',
  CREDIT_CARD = 'credit_card',
  ATM = 'atm',
  CVS = 'cvs'
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
