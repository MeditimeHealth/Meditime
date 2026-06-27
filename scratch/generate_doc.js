const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '..', 'models');
const apisSummaryPath = path.join(__dirname, 'apis_summary.json');
const modelsSummaryPath = path.join(__dirname, 'models_summary.json');

const apis = JSON.parse(fs.readFileSync(apisSummaryPath, 'utf-8'));
const models = JSON.parse(fs.readFileSync(modelsSummaryPath, 'utf-8'));

// Map models for easy access
const modelsMap = {};
models.forEach(m => {
  modelsMap[m.modelName] = m;
});

// Define NestJS modules and map routes / models to them
const modulesConfig = [
  {
    name: 'Auth',
    description: 'Handles user registration, authentication, token verification, and password recovery.',
    routes: [
      'auth/login',
      'auth/signup',
      'auth/logout',
      'auth/verify',
      'auth/forgot-password',
      'auth/google-one-tap'
    ],
    models: ['User']
  },
  {
    name: 'Users',
    description: 'Handles user profiles and general user account settings.',
    routes: [
      'user/profile'
    ],
    models: ['User']
  },
  {
    name: 'Doctors',
    description: 'Manages doctor profiles, ratings, specialities, slot configurations, and availability.',
    routes: [
      'doctors',
      'doctors/[id]',
      'doctors/check-duplicate',
      'doctors/[id]/related',
      'doctor/profile',
      'doctor/stats',
      'doctor/time-slots',
      'doctor/time-slots/[id]',
      'doctor/dashboard'
    ],
    models: ['Doctor', 'DoctorTimeSlot']
  },
  {
    name: 'Appointments',
    description: 'Manages bookings of appointments with doctors.',
    routes: [
      'appointments',
      'appointments/[id]'
    ],
    models: ['Appointment']
  },
  {
    name: 'Affiliate',
    description: 'Handles referral programs, tracking commission, payout requests, and withdrawals.',
    routes: [
      'affiliate/profile',
      'affiliate/referrals',
      'affiliate/reports',
      'affiliate/request',
      'affiliate/wallet',
      'affiliate/withdrawal'
    ],
    models: ['Affiliate', 'AffiliateCommission', 'AffiliateRequest', 'AffiliateWithdrawal']
  },
  {
    name: 'Ambulances',
    description: 'Manages ambulance service listings, locations, and request forms.',
    routes: [
      'ambulances',
      'ambulances/[id]'
    ],
    models: ['Ambulance']
  },
  {
    name: 'BloodDonors',
    description: 'Handles blood donor registration, searching, filtering, and donor profiles.',
    routes: [
      'blood-donors',
      'blood-donors/[id]'
    ],
    models: ['BloodDonor']
  },
  {
    name: 'Diagnostic',
    description: 'Manages diagnostic centers, test catalogs, bookings, and cart abandonment details.',
    routes: [
      'diagnostic/abandoned-cart',
      'diagnostic/bookings',
      'diagnostic/centers',
      'diagnostic/centers/[id]',
      'diagnostic/stats',
      'diagnostic/tests',
      'diagnostic/tests/[id]'
    ],
    models: ['DiagnosticBooking', 'DiagnosticCenter', 'DiagnosticTest', 'AbandonedCart']
  },
  {
    name: 'LiveConsultation',
    description: 'Handles live consultation bookings, video links, room setups, and active consultants list.',
    routes: [
      'live-consultation',
      'live-consultation/[id]'
    ],
    models: ['LiveConsultant', 'ConsultationSession']
  },
  {
    name: 'Memberships',
    description: 'Manages subscription packages, payment details, card verification, and subscription logs.',
    routes: [
      'memberships',
      'memberships/[id]',
      'memberships/payment',
      'memberships/payment/ipn',
      'membership-cards',
      'membership-cards/verify',
      'membership-cards/[id]'
    ],
    models: ['Membership', 'MembershipCard']
  },
  {
    name: 'Blog',
    description: 'Manages medical blogs, categories, sidebar banners/photos, and comments.',
    routes: [
      'blog',
      'blog/posts',
      'blog/[id]',
      'blog-sidebar',
      'blog-sidebar/all',
      'blog-sidebar/[id]'
    ],
    models: ['Blog', 'BlogSidebarPhoto']
  },
  {
    name: 'Locations',
    description: 'Handles administrative divisions, districts, thanas, hospitals, and location-based routing.',
    routes: [
      'locations/divisions',
      'locations/divisions/[id]',
      'locations/districts',
      'locations/districts/[id]',
      'locations/thanas',
      'locations/thanas/[id]',
      'locations/hospitals',
      'locations/hospitals/[id]',
      'hospitals/[slug]/doctors',
      'hospitals/[slug]/nearest'
    ],
    models: ['Division', 'District', 'Thana', 'Hospital']
  },
  {
    name: 'Common',
    description: 'Manages core, static content, popups, contact requests, offers, and image upload configurations.',
    routes: [
      'app-image',
      'departments',
      'departments/[id]',
      'diseases',
      'diseases/[id]',
      'contact',
      'offer',
      'offer/[id]',
      'popup',
      'service-sections',
      'service-sections/all',
      'service-sections/[id]',
      'stats',
      'upload',
      'upload/imgbb'
    ],
    models: ['AppImageSetting', 'Department', 'Disease', 'Offer', 'Popup', 'ServiceSection', 'ContactMessage']
  }
];

let mdContent = `# Meditime Server: NestJS & Mongoose Modular Architecture Specification

This specification document describes the transition of the **Meditime** Next.js Mongoose backend logic and schemas into a modular **NestJS** application structure. It outlines the data models, API endpoints, and architectural blueprints for client-side features, excluding the admin-specific dashboard logic.

---

## Architectural Guidelines

To implement a clean, maintainable, and scalable backend in NestJS, the following design principles are enforced:

1. **Modular Design**: Every functional domain has its own self-contained module (e.g., \`AuthModule\`, \`DoctorModule\`). Each module will group its components: Schema, DTOs, Controller, Service, and Module definition.
2. **NestJS & Mongoose Integration**: Use \`@nestjs/mongoose\` to import schemas and inject models into services.
3. **DTOs (Data Transfer Objects)**: All endpoints must use class-validator based DTOs for payload definition and validation.
4. **Guards & Decorators**: Authenticated routes will rely on NestJS Guards (e.g., \`JwtAuthGuard\`, \`RolesGuard\`) and custom decorators for current user injection.
5. **Exceptions & Logging**: Unified exception handling via global exception filters.

\`\`\`
src/
├── app.module.ts              # Root module importing all feature modules
├── main.ts                    # Server bootstrapping
├── common/                    # Core decorators, filters, interceptors, guards
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   └── strategies/
└── modules/                   # Feature-based modular directories
    ├── auth/
    ├── users/
    ├── doctors/
    ├── appointments/
    ├── affiliate/
    ├── ambulances/
    ├── blood-donors/
    ├── diagnostic/
    ├── live-consultation/
    ├── memberships/
    ├── blog/
    ├── locations/
    └── common/
\`\`\`

---

## Proposed Modules & Detailed Specifications

`;

modulesConfig.forEach(mod => {
  mdContent += `### 📦 ${mod.name}Module\n\n`;
  mdContent += `**Description**: ${mod.description}\n\n`;
  
  // Section for Models
  mdContent += `#### 🗄️ Database Models (${mod.models.length})\n\n`;
  mod.models.forEach(modelName => {
    const modelData = modelsMap[modelName];
    if (modelData) {
      mdContent += `##### \`${modelName}\` Model\n\n`;
      if (modelData.interface && modelData.interface !== 'Not Found') {
        mdContent += `**TypeScript Interface**:\n\`\`\`typescript\n${modelData.interface.trim()}\n\`\`\`\n\n`;
      }
      if (modelData.schemaSnippet && modelData.schemaSnippet !== 'Not Found') {
        mdContent += `**Mongoose Schema Definition**:\n\`\`\`typescript\n${modelData.schemaSnippet.trim()}\n\`\`\`\n\n`;
      }
    } else {
      mdContent += `##### \`${modelName}\` Model\n*Definition not found in models/ folder.*\n\n`;
    }
  });

  // Section for Routes
  mdContent += `#### 🔌 API Endpoints\n\n`;
  const matchingRoutes = apis.filter(api => {
    // Check if api.file matches any of the patterns in mod.routes
    return mod.routes.some(r => {
      const parts = r.split('/');
      const apiParts = api.file.replace('/route.ts', '').replace('/route.js', '').split('/');
      if (parts.length !== apiParts.length) return false;
      return parts.every((p, index) => {
        return p.startsWith('[') || p === apiParts[index];
      });
    });
  });

  if (matchingRoutes.length > 0) {
    matchingRoutes.forEach(api => {
      const endpointPath = '/api/' + api.file.replace('/route.ts', '').replace('/route.js', '');
      mdContent += `##### \`${endpointPath}\`\n`;
      mdContent += `- **File**: \`${api.file}\`\n`;
      mdContent += `- **Supported Methods**: ${api.methods.map(m => `\`${m}\``).join(', ')}\n`;
      mdContent += `- **Associated Models**: ${api.modelsUsed.map(m => `\`${m}\``).join(', ') || '*None*'}\n\n`;
      
      // Let's add details per method
      api.methods.forEach(method => {
        mdContent += `###### Method \`${method}\` Details\n`;
        mdContent += `- **Controller Mapping**: \`@${method.charAt(0) + method.slice(1).toLowerCase()}('${endpointPath.replace('/api/', '')}')\`\n`;
        
        // Infer payloads/responses based on common patterns
        if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
          mdContent += `- **Request Body**: Validated via DTO matching model fields.\n`;
        } else if (method === 'GET') {
          mdContent += `- **Query Parameters**: For filtering, pagination, and sorting.\n`;
        }
        mdContent += `- **Access Level**: ${endpointPath.includes('profile') || endpointPath.includes('dashboard') || endpointPath.includes('appointments') || endpointPath.includes('wallet') || endpointPath.includes('withdrawal') || endpointPath.includes('referrals') || endpointPath.includes('reports') ? '🔒 Protected (User/Doctor/Affiliate Token Required)' : '🔓 Public'}\n\n`;
      });
    });
  } else {
    mdContent += `*No client-facing endpoints associated with this module.*\n\n`;
  }
  mdContent += `---\n\n`;
});

// Save spec file to medi_backend
const targetPath = path.join('e:', 'Web Dev', 'Freelance', 'medi_backend', 'meditime_nest_spec.md');
fs.writeFileSync(targetPath, mdContent);
console.log('Successfully written spec file to', targetPath);
