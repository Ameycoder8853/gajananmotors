# Release Notes - Gajanan Motors v1.0.0

## New Features
- **Manual Location Selector**: Users can now browse cars by State and City using a new dedicated selector in the header.
- **Account Deletion**: Integrated a secure "Danger Zone" in Settings, allowing users to permanently delete their profiles and listings.
- **Store Reviewer Bypass**: Implemented logic to allow Google Play reviewers (using `tester@gajananmotors.com`) to bypass OTP and Payment hurdles for easier app approval.
- **Dedicated Contact Page**: Added a professional contact form and support details for store compliance.

## Improvements
- **Mobile Responsiveness**: 
  - Redesigned the Header to be significantly more compact on small screens.
  - Hides location text on mobile to prioritize the Logo and Menu.
  - Guaranteed Hero section visibility across all device types.
- **UI & UX Refinements**:
  - Closed "Additional Filters" by default for a cleaner marketplace entry.
  - Optimized spacing and removed unnecessary margins in filter components.
  - Removed placeholder/mock testimonials and statistics for a more authentic landing page.
- **Static Hero**: Switched to a static high-quality background image in the Hero section to improve performance and stability.

## Performance & SEO
- **Horizontal Scroll Fix**: Enforced strict overflow controls in CSS to eliminate unwanted horizontal shifting on mobile.
- **Live Metadata**: Updated all site configuration, metadata, and sitemaps to point to `gajananmotors.vercel.app`.
- **Privacy Policy**: Updated with comprehensive details on dealer verification (Aadhar/PAN), Razorpay integration, and AI moderation.

## Bug Fixes
- Fixed spacing bugs in the Collapsible filter component.
- Resolved issues where the Hero section was occasionally invisible on certain browsers.
- Corrected horizontal layout overflow on the Marketplace page.
