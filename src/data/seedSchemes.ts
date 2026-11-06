import { ScholarshipScheme, StudentProfile } from '../types';

export const SEED_SCHEMES: ScholarshipScheme[] = [
  {
    id: 'pmss-central',
    title: "Prime Minister's Scholarship Scheme (PMSS)",
    provider: 'Welfare and Rehabilitation Board (WARB), Ministry of Home Affairs',
    benefitAmount: '₹3,000/month (Girls) & ₹2,500/month (Boys)',
    deadline: '31st December 2026',
    categoryTags: ['Defense/CAPF Wards', 'Engineering', 'Medical', 'Undergraduate'],
    eligibleStates: ['All'],
    eligibleCategories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    incomeLimit: 600000,
    applyUrl: 'https://scholarships.gov.in',
    requiredDocuments: [
      'Discharge Certificate / Ex-Servicemen Certificate',
      'Bonafide Student Certificate from College',
      'Class 12th Marksheet (Min 60%)',
      'Aadhaar Linked Bank Passbook Copy'
    ],
    description: 'Encourages higher technical and professional education for dependent wards of deceased/ex-service personnel of Central Armed Police Forces & Assam Rifles.'
  },
  {
    id: 'post-matric-obc-sc-st',
    title: 'Post-Matric Scholarship for SC/ST/OBC Students',
    provider: 'Ministry of Social Justice and Empowerment, Govt of India',
    benefitAmount: '100% Tuition Fee Reversal + Maintenance Allowance up to ₹13,500/year',
    deadline: '30th November 2026',
    categoryTags: ['Tuition Waiver', 'Hostel Subsidy', 'All Courses'],
    eligibleStates: ['All'],
    eligibleCategories: ['OBC', 'SC', 'ST'],
    incomeLimit: 250000,
    applyUrl: 'https://scholarships.gov.in',
    requiredDocuments: [
      'Valid Caste Certificate issued by Competent Authority',
      'Current Year Income Certificate (below ₹2.5 Lakh)',
      'Previous Exam Marksheet & Fee Receipt',
      'Hostel Warden Certificate (if hosteller)'
    ],
    description: 'Provides complete financial assistance to students belonging to Scheduled Castes, Tribes and Other Backward Classes studying at post-matriculation or post-secondary stages.'
  },
  {
    id: 'tata-trusts-grant',
    title: 'Tata Trusts Means Grant for Higher Education',
    provider: 'Tata Trusts Educational Community',
    benefitAmount: 'Up to ₹50,000 per academic year towards college tuition',
    deadline: '15th October 2026',
    categoryTags: ['Merit-cum-Means', 'Engineering', 'Healthcare', 'Private Grant'],
    eligibleStates: ['All'],
    eligibleCategories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    incomeLimit: 450000,
    applyUrl: 'https://tatatrusts.org',
    requiredDocuments: [
      'College Bonafide and Verified Fee Structure',
      'Latest Family Income Tax Returns / Income Certificate',
      'Last Two Semesters Grade Cards',
      'Statement of Purpose (SOP)'
    ],
    description: 'Merit-cum-means assistance offered to deserving students facing financial hardship pursuing undergraduate and postgraduate degrees across India.'
  },
  {
    id: 'csss-central',
    title: 'Central Sector Scheme of Scholarships for College Students (CSSS)',
    provider: 'Department of Higher Education, Ministry of Education',
    benefitAmount: '₹12,000/year for first 3 years; ₹20,000/year for PG',
    deadline: '15th December 2026',
    categoryTags: ['Top 20th Percentile', 'Degree Courses', 'Central Govt'],
    eligibleStates: ['All'],
    eligibleCategories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    incomeLimit: 450000,
    applyUrl: 'https://scholarships.gov.in',
    requiredDocuments: [
      'Class 12th Board Certificate with Roll Number',
      'Annual Income Certificate (< ₹4.5 Lakh)',
      'College Admission Letter',
      'Bank Account linked to Aadhaar'
    ],
    description: 'Awarded to meritorious students who scored above the 80th percentile in relevant stream from respective State Education Boards in Class 12th.'
  },
  {
    id: 'vidya-lakshmi-portal',
    title: 'Vidya Lakshmi Portal Education Loan Scheme (Govt Subsidized)',
    provider: 'Indian Banks Association (IBA) & Dept of Financial Services',
    benefitAmount: 'Up to ₹7.5 Lakh without collateral + CSIS Interest Subsidy',
    deadline: 'Rolling / Open Throughout Year',
    categoryTags: ['Collateral Free', 'Interest Subsidy during Moratorium', 'Higher Studies'],
    eligibleStates: ['All'],
    eligibleCategories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    incomeLimit: 450000,
    applyUrl: 'https://vidyalakshmi.co.in',
    requiredDocuments: [
      'Letter of Admission from Recognized University/College',
      'College Fee Schedule & Hostel Charges',
      'Parent/Guardian Income Proof & PAN Card',
      'Academic Record from Class 10th onwards'
    ],
    description: 'Single window portal connecting students to 40+ banks with full Central Sector Interest Subsidy (CSIS) during the moratorium period for families earning under ₹4.5 Lakh.'
  },
  {
    id: 'bihar-student-credit-card',
    title: 'Bihar Student Credit Card Scheme (MNSSBY)',
    provider: 'Bihar State Educational Finance Corporation, Govt of Bihar',
    benefitAmount: 'Up to ₹4 Lakh education loan at 1% interest (Girls/Divyang) / 4% (Boys)',
    deadline: 'Open Throughout Academic Year',
    categoryTags: ['State Scheme', 'Subsidized Credit', 'Technical & Higher Studies'],
    eligibleStates: ['Bihar'],
    eligibleCategories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    incomeLimit: 1000000,
    applyUrl: 'https://7nishchay-yuvaupmission.bihar.gov.in',
    requiredDocuments: [
      'Bihar Domicile Certificate',
      '10th and 12th Passing Certificates',
      'Admission Slip with Institute Fee Brochure',
      'Applicant & Co-applicant Aadhaar + 2 Photographs'
    ],
    description: 'Part of Bihar’s Saat Nischay initiative ensuring no student drops out after 12th due to poverty. Offers low-interest credit for 80+ recognized professional courses.'
  },
  {
    id: 'aicte-pragati',
    title: 'AICTE Pragati Scholarship for Girl Students',
    provider: 'All India Council for Technical Education (AICTE)',
    benefitAmount: '₹50,000 per annum for tuition, laptop and book expenses',
    deadline: '31st January 2027',
    categoryTags: ['Girls Only', 'AICTE Approved Colleges', 'Diploma & B.Tech'],
    eligibleStates: ['All'],
    eligibleCategories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    incomeLimit: 800000,
    applyUrl: 'https://aicte-pragati-saksham-gov.in',
    requiredDocuments: [
      'AICTE Approved College Allotment Letter',
      'Family Income Certificate (below ₹8 Lakh)',
      'Class 10/12 Marksheet',
      'Tuition Fee Receipt'
    ],
    description: 'Dedicated national scheme empowering female students admitted to 1st year degree/diploma technical programs in AICTE approved institutions.'
  },
  {
    id: 'mysy-gujarat',
    title: 'Mukhyamantri Yuva Swavalamban Yojana (MYSY)',
    provider: 'Education Department, Government of Gujarat',
    benefitAmount: '50% Tuition assistance (up to ₹2 Lakh for Medical, ₹50,000 for Engg) + ₹12,000 Hostel',
    deadline: '28th February 2027',
    categoryTags: ['Gujarat State', 'Merit 80th Percentile', 'Hostel Subsidy'],
    eligibleStates: ['Gujarat'],
    eligibleCategories: ['General', 'EWS', 'OBC', 'SC', 'ST'],
    incomeLimit: 600000,
    applyUrl: 'https://mysy.guj.nic.in',
    requiredDocuments: [
      'Gujarat Domicile Certificate',
      '10th or 12th Marksheet (Minimum 80 Percentile)',
      'Income Certificate (< ₹6 Lakh)',
      'Admission Confirmation & Self-Declaration'
    ],
    description: 'Provides substantial tuition fee waiver, book grant, and hostel allowance for meritorious students in Gujarat studying Engineering, Pharmacy, Diploma, and Medical sciences.'
  }
];

export const matchSchemesForProfile = (
  schemes: ScholarshipScheme[],
  profile: StudentProfile
): ScholarshipScheme[] => {
  return schemes.map((scheme) => {
    let score = 0;

    // Check State eligibility
    const stateMatches =
      scheme.eligibleStates.includes('All') ||
      scheme.eligibleStates.some(
        (s) => s.toLowerCase() === (profile.state || '').toLowerCase()
      );
    if (stateMatches) score += 2;

    // Check Category eligibility
    const categoryMatches =
      scheme.eligibleCategories.includes(profile.category) ||
      (profile.gender === 'Female' && scheme.categoryTags.includes('Girls Only'));
    if (categoryMatches) score += 2;

    // Check Income limit
    let maxProfileIncome = 300000;
    if (profile.incomeBracket === '< 1.5 Lakh') maxProfileIncome = 120000;
    else if (profile.incomeBracket === '1.5 - 3 Lakh') maxProfileIncome = 250000;
    else if (profile.incomeBracket === '3 - 6 Lakh') maxProfileIncome = 500000;
    else if (profile.incomeBracket === '6 - 10 Lakh') maxProfileIncome = 850000;
    else if (profile.incomeBracket === '> 10 Lakh') maxProfileIncome = 1200000;

    if (maxProfileIncome <= scheme.incomeLimit) score += 2;

    // Check Course / Degree relevance
    const courseLower = (profile.course || '').toLowerCase();
    const isTech =
      courseLower.includes('eng') ||
      courseLower.includes('b.tech') ||
      courseLower.includes('btech') ||
      courseLower.includes('bca') ||
      courseLower.includes('cs') ||
      courseLower.includes('polytechnic') ||
      courseLower.includes('diploma');

    if (
      isTech &&
      (scheme.categoryTags.includes('Engineering') ||
        scheme.categoryTags.includes('Technical & Higher Studies') ||
        scheme.categoryTags.includes('AICTE Approved Colleges'))
    ) {
      score += 2;
    }

    let matchScore: 'Strong' | 'Likely' | 'Possible' = 'Possible';
    if (score >= 6) matchScore = 'Strong';
    else if (score >= 4) matchScore = 'Likely';

    return {
      ...scheme,
      matchScore
    };
  });
};
