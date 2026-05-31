# Meditime Doctor Schema Refactoring Report
**Date**: May 31, 2026

## 1. Executive Summary

This report documents the design plan and successful implementation of the Meditime doctor data model refactoring. The primary objective was to transition from a flat, single-hospital database structure to a flexible, multi-hospital availability slot architecture. This change allows doctors to practice at multiple hospitals across different time slots and locations. 

Additionally, we designed and implemented a duplicate-doctor detection mechanism in the admin panel to prevent redundant profiles, and aligned all patient-facing booking screens, search listing filters, and dashboards with the new schema.

---

## 2. Schema Architecture Comparison

### Legacy Flat Schema
Previously, the doctor model stored only one hospital and one flat set of location fields per doctor:
- `hospital`: string
- `hospitalBn`: string (optional)
- `division`, `district`, `thana`: strings (optional)
- `divisionBn`, `districtBn`, `thanaBn`: strings (optional)
- `availability`: A flat list of days and time slots, assuming all took place at the single hospital.

### Refactored Slot-Based Schema
All legacy flat fields were removed from the doctor model. Location and hospital data are now dynamically associated with individual time slots:
- Removed: `hospital`, `hospitalBn`, `division`, `divisionBn`, `district`, `districtBn`, `thana`, `thanaBn`
- Added: `availability` became an array of slot objects where each slot requires a specific hospital slug:
```typescript
availability: Array<{
  days: string[];
  daysBn?: string[];
  time?: string;
  timeBn?: string;
  hospital: string; // Hospital slug (required)
}>;
```
- Added: `hospitalSlug` string field added to the `Appointment` model to trace where each booking takes place.

---

## 3. Completed Plan & Checklist

The project refactoring was successfully executed across seven distinct phases:

### Phase 1: Data Model Layer
*   **Doctor Model (`models/Doctor.ts`)**: Removed legacy fields, updated TypeScript interfaces, restructured the `availability` array validator to enforce required slot-level hospital slugs, and created an index on `{"availability.hospital": 1}` for high-performance indexing.
*   **Appointment Model (`models/Appointment.ts`)**: Appended `hospitalSlug` to the schema while keeping the legacy `hospitalName` for backwards compatibility.

### Phase 2: API Layer
*   **Duplicate Detection (`app/api/doctors/check-duplicate/route.ts`)**: Created a POST endpoint using Levenshtein distance calculations to compare profile fields (name, designation, specialty, qualification) and return matching candidates scoring $\ge 80\%$ similarity.
*   **Doctors Query API (`app/api/doctors/route.ts` & `app/api/doctors/[id]/route.ts`)**: Updated backend handlers to query and filter doctors based on slot-level hospital slugs (`availability.hospital`), simplified locations, and removed flat properties from POST/PUT creation handlers.
*   **Appointments Creation API (`app/api/appointments/route.ts`)**: Refactored to accept `hospitalSlug` and automatically resolve the appropriate English/Bangla hospital names from the database during creation.

### Phase 3: Admin Dashboard Forms
*   **Doctor Forms (`app/admin/doctors/create/page.tsx` & `edit/[id]/page.tsx`)**: Removed top-level selects. Integrated `useFieldArray` to allow admins to manage multiple availability slots with individual hospital dropdowns.
*   **Duplicate Prevention**: Integrated the duplicate check API with a debounced warning modal in both forms, alerting admins if a similar profile already exists before saving.

### Phase 4: Public Booking Flow
*   **Doctor Cards (`components/doctor-card.tsx`)**: Removed legacy single hospital lines and fully aligned type interfaces.
*   **Doctor Profile (`app/doctor/[id]/DoctorProfileClient.tsx`)**: Grouped the Chamber Schedule by hospital slug, displaying interactive links routing patients to book specific chambers. Cleaned up SEO metadata JSON-LD and FAQs to dynamically generate practice listings using availability slots.
*   **Booking Process (`app/doctor/[id]/book/page.tsx`, `checkout/page.tsx`, `success/page.tsx`)**: Fully slot-aligned. Filters calendar dates by slot, forwards selection parameters through to checkout, and saves the target hospital slug in the appointment record.

### Phase 5: Hospital & Specialty Lists
*   **Hospital Page (`app/hospital/[slug]/HospitalDetailClient.tsx`)**: Restructured fetch requests to query doctors using `hospitalSlug` instead of flat names.
*   **Search Lists (`app/doctor/DoctorListPageClient.tsx` & `app/departments/[name]/page.tsx`)**: Integrated multi-hospital slot searches into the filters and queries, mapping options to localized hospital names and slugs.

### Phase 6: Dashboards and User View Pages
*   **Admin Appointments (`app/admin/appointments/page.tsx`)**: Aligned TypeScript interface parameters with the new schema.
*   **User Appointments (`app/user/appointments/[id]/page.tsx`)**: Removed legacy flat fallbacks, pulling directly from appointment records.

---

## 4. Compilation & Verification Results

Verification was performed using Next.js compilation, type-checking, and static generation. The build finished with **zero errors**:

```bash
npm run build

> meditime@0.1.0 build
> next build

▲ Next.js 16.2.4 (Turbopack)
- Environments: .env.local

  Creating an optimized production build ...
✓ Compiled successfully in 10.3s
  Running TypeScript ...
✓ Generating static pages using 11 workers (155/155) in 4.0s
  Finalizing page optimization ...

Route (app)
├ ○ /
├ ○ /admin/doctors
├ ƒ /api/doctors/check-duplicate
├ ƒ /doctor/[id]/book/success
├ ƒ /hospital/[slug]
└ ○ /user/dashboard
```

---

## 5. Conclusion & Recommendations

The Meditime multi-hospital slot system is fully implemented and compiled. 

### Recommendations:
1. **Clean DB Slate**: As confirmed during planning, database records from the old flat schema should be deleted to prevent mismatch errors with the strict slot validation.
2. **Hospital Slugs Verification**: Ensure all hospitals are loaded with unique, non-empty `slug` strings in the Hospital collection, as they serve as the primary relationship keys in the doctor slots.
