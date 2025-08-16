/**
 * 證書相關測試資料 Fixtures
 * 提供證書管理測試所需的標準測試資料
 */

import { TeacherCertificate } from '@entities/TeacherCertificate'

// 有效的證書測試資料
export const validCertificateData = {
  verifying_institution: '教育部',
  license_name: '中等學校教師證書',
  holder_name: '王小明',
  license_number: 'TC2024001234',
  file_path: '/uploads/certificates/tc_2024001234.pdf',
  category_id: 'teaching_license',
  subject: '數學科教學'
}

// 無效的證書測試資料
export const invalidCertificateData = {
  missingInstitution: {
    license_name: '中等學校教師證書',
    holder_name: '王小明',
    license_number: 'TC2024001234',
    file_path: '/uploads/certificates/tc_2024001234.pdf',
    category_id: 'teaching_license',
    subject: '數學科教學'
  },
  missingLicenseName: {
    verifying_institution: '教育部',
    holder_name: '王小明',
    license_number: 'TC2024001234',
    file_path: '/uploads/certificates/tc_2024001234.pdf',
    category_id: 'teaching_license',
    subject: '數學科教學'
  },
  missingHolderName: {
    verifying_institution: '教育部',
    license_name: '中等學校教師證書',
    license_number: 'TC2024001234',
    file_path: '/uploads/certificates/tc_2024001234.pdf',
    category_id: 'teaching_license',
    subject: '數學科教學'
  },
  tooLongInstitution: {
    verifying_institution: 'A'.repeat(101), // 超過100字元限制
    license_name: '中等學校教師證書',
    holder_name: '王小明',
    license_number: 'TC2024001234',
    file_path: '/uploads/certificates/tc_2024001234.pdf',
    category_id: 'teaching_license',
    subject: '數學科教學'
  },
  tooLongLicenseName: {
    verifying_institution: '教育部',
    license_name: 'A'.repeat(201), // 超過200字元限制
    holder_name: '王小明',
    license_number: 'TC2024001234',
    file_path: '/uploads/certificates/tc_2024001234.pdf',
    category_id: 'teaching_license',
    subject: '數學科教學'
  }
}

// 證書更新測試資料
export const certificateUpdateData = {
  partialUpdate: {
    license_name: '高級中等學校教師證書',
    subject: '高中數學科教學'
  },
  fullUpdate: {
    verifying_institution: '教育部師資培育及藝術教育司',
    license_name: '高級中等學校教師證書',
    holder_name: '王小明',
    license_number: 'TC2024001235',
    file_path: '/uploads/certificates/tc_2024001235_updated.pdf',
    category_id: 'advanced_teaching_license',
    subject: '高中數學科教學'
  }
}

// 多個證書測試場景
export const multipleCertificatesData = [
  {
    verifying_institution: '教育部',
    license_name: '中等學校教師證書',
    holder_name: '王小明',
    license_number: 'TC2024001234',
    file_path: '/uploads/certificates/tc_2024001234.pdf',
    category_id: 'teaching_license',
    subject: '數學科教學'
  },
  {
    verifying_institution: '國立台灣師範大學',
    license_name: '英語教學能力認證',
    holder_name: '王小明',
    license_number: 'TESOL2024567',
    file_path: '/uploads/certificates/tesol_2024567.pdf',
    category_id: 'language_certification',
    subject: '英語教學'
  },
  {
    verifying_institution: '中華民國電腦技能基金會',
    license_name: '電腦技能認證',
    holder_name: '王小明',
    license_number: 'CSF2024789',
    file_path: '/uploads/certificates/csf_2024789.pdf',
    category_id: 'professional_certificate',
    subject: '資訊技術'
  }
]

// 建立證書實體資料
export const createCertificateEntityData = (teacherId: number, overrides = {}): Partial<TeacherCertificate> => ({
  teacher_id: teacherId,
  ...validCertificateData,
  ...overrides
})

// 不同證書類別的測試資料
export const certificateByCategory = {
  teaching_license: {
    ...validCertificateData,
    verifying_institution: '教育部',
    license_name: '中等學校教師證書',
    category_id: 'teaching_license',
    subject: '數學科教學'
  },
  language_certification: {
    ...validCertificateData,
    verifying_institution: '國立台灣師範大學',
    license_name: '英語教學能力認證',
    license_number: 'TESOL2024567',
    category_id: 'language_certification',
    subject: '英語教學',
    file_path: '/uploads/certificates/tesol_2024567.pdf'
  },
  professional_certificate: {
    ...validCertificateData,
    verifying_institution: '中華民國電腦技能基金會',
    license_name: '電腦技能認證',
    license_number: 'CSF2024789',
    category_id: 'professional_certificate',
    subject: '資訊技術',
    file_path: '/uploads/certificates/csf_2024789.pdf'
  },
  academic_degree: {
    ...validCertificateData,
    verifying_institution: '國立台灣大學',
    license_name: '數學學士學位證書',
    license_number: 'NTU2024456',
    category_id: 'academic_degree',
    subject: '數學系',
    file_path: '/uploads/certificates/ntu_2024456.pdf'
  }
}

// 證書驗證錯誤測試案例
export const certificateValidationErrors = {
  required_fields: {
    testData: {},
    expectedErrors: [
      'verifying_institution',
      'license_name', 
      'holder_name',
      'license_number',
      'file_path',
      'category_id',
      'subject'
    ]
  },
  field_lengths: {
    testData: {
      verifying_institution: 'A'.repeat(101),
      license_name: 'B'.repeat(201),
      holder_name: 'C'.repeat(101),
      license_number: 'D'.repeat(101),
      file_path: 'E'.repeat(501),
      category_id: 'F'.repeat(51),
      subject: 'G'.repeat(201)
    },
    expectedErrors: [
      'verifying_institution',
      'license_name',
      'holder_name', 
      'license_number',
      'file_path',
      'category_id',
      'subject'
    ]
  }
}